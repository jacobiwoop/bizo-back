# Bizo — Recherche localisation

Document de travail pour construire le système de localisation Bizo.

Objectif: enrichir progressivement notre propre base de lieux pour les annonces, la recherche et les repères publics.

## Vision produit

Bizo doit pouvoir gérer:

- pays, villes et quartiers;
- lieux précis comme banques, pharmacies, stations-service, écoles, marchés;
- recherche utilisateur avec correction et suggestions;
- géolocalisation GPS optionnelle;
- affichage public respectant la confidentialité du vendeur;
- recherche autour de moi et tri par distance.

## Stratégie source de données

Ordre recommandé:

1. Chercher d'abord dans notre BDD.
2. Si absent, chercher via OSM.
3. Si OSM ne trouve pas ou donne un résultat faible, fallback Mapbox.
4. Sauvegarder le résultat utile en BDD avec sa source.
5. Réutiliser notre BDD aux prochaines recherches.

Important: toute donnée externe sauvegardée doit garder une traçabilité.

## Tables envisagées

### `locations`

Pour les zones administratives et zones de recherche.

```sql
locations
  id
  name
  slug
  type enum('country','city','district')
  parent_id nullable
  country_code
  lat
  lng
  source enum('osm','mapbox','user','admin','import')
  external_id nullable
  confidence decimal nullable
  is_verified boolean
```

### `places`

Pour les points de repère et lieux précis.

```sql
places
  id
  name
  category
  location_id nullable
  country_code
  lat
  lng
  source enum('osm','mapbox','user','admin','import')
  external_id nullable
  confidence decimal nullable
  is_verified boolean
```

Exemples de `category`:

- `bank`
- `atm`
- `pharmacy`
- `fuel`
- `school`
- `hospital`
- `market`
- `restaurant`

### `pending_locations`

Pour les quartiers ou lieux saisis par les utilisateurs mais pas encore validés.

```sql
pending_locations
  id
  name
  normalized_name
  parent_id nullable
  country_code
  suggested_lat nullable
  suggested_lng nullable
  source
  usage_count
  status enum('pending','approved','rejected','merged')
```

## Flow de recherche

```txt
User tape "UBA Cadjéhoun"
  -> BDD places/locations
  -> OSM
  -> Mapbox fallback
  -> normalisation
  -> sauvegarde si résultat exploitable
  -> réponse app
```

## Implémentation backend actuelle

Endpoints disponibles:

```txt
GET  /api/v1/locations/search
GET  /api/v1/locations/cities
GET  /api/v1/locations/{id}/districts
GET  /api/v1/places/search
POST /api/v1/locations/suggest
```

Paramètre important:

```txt
enrich=1
```

Sans `enrich=1`, l'API lit seulement notre BDD. Avec `enrich=1`, elle essaie d'enrichir depuis OSM, puis Mapbox si OSM ne suffit pas, et sauvegarde les résultats avec `is_verified=false`.

Exemples Bizo API:

```bash
curl -sS -G "https://bizo.aiko.qzz.io/api/v1/locations/search" \
  --data-urlencode "q=Cadjehoun" \
  --data-urlencode "country=BJ" \
  --data-urlencode "type=district" \
  --data-urlencode "enrich=1"
```

```bash
curl -sS -G "https://bizo.aiko.qzz.io/api/v1/places/search" \
  --data-urlencode "q=pharmacie Cadjehoun Cotonou" \
  --data-urlencode "country=BJ" \
  --data-urlencode "enrich=1"
```

```bash
curl -sS -G "https://bizo.aiko.qzz.io/api/v1/places/search" \
  --data-urlencode "lat=6.361438" \
  --data-urlencode "lng=2.3994" \
  --data-urlencode "radius_km=2" \
  --data-urlencode "category=pharmacy" \
  --data-urlencode "country=BJ" \
  --data-urlencode "enrich=1"
```

Variables serveur nécessaires:

```txt
BIZO_OSM_USER_AGENT="BizoLocationResearch/1.0 (contact: contact@bizo.local)"
MAPBOX_TOKEN=
```

## Règles de sauvegarde

Ne jamais sauvegarder un lieu externe sans:

- `source`;
- `external_id` si disponible;
- `country_code`;
- coordonnées;
- type ou catégorie;
- statut `is_verified = false` par défaut.

Pour Mapbox, attention aux droits de stockage:

- Geocoding API peut avoir un mode permanent selon le plan et le paramètre `permanent=true`.
- Search Box API indique que les résultats sont temporaires sauf accord spécifique avec Mapbox.
- Donc, pour enrichir durablement notre BDD avec Mapbox, il faut valider le mode légal avant de sauvegarder des résultats Mapbox.

## APIs Mapbox à étudier

### Geocoding API v6

Endpoint testé:

```txt
GET https://api.mapbox.com/search/geocode/v6/forward
```

Usage prévu:

- villes;
- quartiers/localités;
- adresses approximatives;
- reverse geocoding.

Limite probable:

- moins adapté aux POI riches comme banques/pharmacies que Search Box.

### Search Box API

Endpoints à tester:

```txt
GET https://api.mapbox.com/search/searchbox/v1/forward
GET https://api.mapbox.com/search/searchbox/v1/suggest
GET https://api.mapbox.com/search/searchbox/v1/retrieve/{id}
GET https://api.mapbox.com/search/searchbox/v1/category/{category_id}
```

Usage prévu:

- autocomplete;
- POI;
- recherche de banques, pharmacies, stations, marchés;
- recherche par catégorie autour d'une position.

Limite importante:

- les résultats Search Box sont indiqués comme temporaires dans la documentation Mapbox, sauf accord spécifique.

## Tests Mapbox réalisés

Token local détecté dans `.env`: oui.

Commande test utilisée: Geocoding API v6 forward avec `country=bj`, `language=fr`, `limit=5`.

### Résultats obtenus

#### Query: `Cotonou Cadjehoun`

Résultats retournés:

```txt
- Cotonou | type=place | coords=[2.4401,6.373391]
- Cadjéhoun | type=locality | coords=[2.3994,6.361438]
- Kotonou | type=locality | coords=[2.151657,7.098167]
```

Observation:

- Bon signal pour ville + quartier/localité.
- Il faudra vérifier le classement et les types exacts par pays.

## Résultats batterie de tests — Bénin

Date: 2026-05-29.

### Mapbox Geocoding v6

Quartiers/localités testés:

```txt
Cadjéhoun Cotonou
Fidjrossè Cotonou
Akpakpa Cotonou
Ganhi Cotonou
Godomey Abomey-Calavi
```

Résultats utiles:

```txt
Cadjéhoun Cotonou
- Cotonou | place | [2.4401,6.373391]
- Cadjéhoun | locality | [2.3994,6.361438]

Fidjrossè Cotonou
- Cotonou | place | [2.4401,6.373391]
- Fidjrossé | locality | [2.367549,6.352503]

Akpakpa Cotonou
- Cotonou | place | [2.4401,6.373391]
- Kpakpa | place | [2.321184,7.895838]

Ganhi Cotonou
- Ganhi | locality | [2.438104,6.354762]
- Cotonou | place | [2.4401,6.373391]

Godomey Abomey-Calavi
- Abomey-Calavi | place | [2.354245,6.453864]
- Godomey | place | [2.343241,6.385444]
```

Observations:

- Mapbox Geocoding est bon pour `Cotonou`, `Cadjéhoun`, `Fidjrossé`, `Ganhi`, `Godomey`.
- `Akpakpa` est moins fiable: il ne ressort pas clairement comme quartier de Cotonou dans les premiers résultats.
- Mapbox retourne parfois la ville avant le quartier: côté backend, il faudra scorer les résultats en privilégiant `locality` quand l'utilisateur cherche un quartier.

### Mapbox Search Box

POI testés:

```txt
UBA Cadjéhoun Cotonou
Ecobank Ganhi Cotonou
Pharmacie Camp Guezo Cotonou
station service Cotonou
Marché Dantokpa Cotonou
```

Résultats:

```txt
UBA Cadjéhoun Cotonou
- Cotonou
- Kotonou
- Cadjéhoun

Ecobank Ganhi Cotonou
- Ganhi
- Cotonou
- Kotonou

Pharmacie Camp Guezo Cotonou
- Cotonou
- Kotonou

station service Cotonou
- aucun résultat exploitable dans ce test

Marché Dantokpa Cotonou
- Dantokpa | [2.431404,6.375532]
- Cotonou
- Kotonou
```

Tests category autour de Cadjéhoun:

```txt
bank: 0
atm: 0
pharmacy: 0
gas_station: 0
hospital: 0
school: 0
market: 0
restaurant: 0
```

Observations:

- Search Box n'a pas bien trouvé les POI précis sur cette passe.
- Il trouve `Dantokpa`, mais sans catégorie exploitable dans la sortie testée.
- Les catégories Mapbox autour de Cadjéhoun ont retourné 0 résultat.
- Pour le Bénin, Mapbox paraît utile pour quartiers/localités, mais pas suffisant comme source POI principale dans les tests actuels.

### Nominatim

Quartiers/localités:

```txt
Cadjéhoun
- Cadjéhoun, 12e Arrondissement, Cotonou | place/neighbourhood | osm=node:7623561066 | 6.3584848,2.3951161

Fidjrossè
- Fidjrossé, 12e Arrondissement, Cotonou | place/neighbourhood | osm=node:2488243338 | 6.3525033,2.3675491

Akpakpa
- Akpakpa-Dodomè, 4ème Arrondissement, Cotonou | place/neighbourhood | osm=node:7716473541 | 6.3588607,2.4556294

Godomey
- Godomey, Abomey-Calavi | place/town | osm=node:2348404091 | 6.3854438,2.3432407
```

POI:

```txt
Ecobank Ganhi Cotonou
- Ecobank | amenity/bank | osm=node:3259902661 | 6.3599701,2.4353425

pharmacie Cadjéhoun Cotonou
- Pharmacie Cadjehoun | amenity/pharmacy | osm=node:3872880785 | 6.3611624,2.3976738
- Pharmacie | amenity/pharmacy | osm=node:2782366114 | 6.3569121,2.4008066

Marché Dantokpa Cotonou
- Marché Dantokpa | amenity/marketplace | osm=way:241551999 | 6.3727119,2.4335084
```

Observations:

- Nominatim est très bon pour les quartiers testés au Bénin.
- Nominatim trouve aussi certains POI précis avec tags exploitables: `amenity/bank`, `amenity/pharmacy`, `amenity/marketplace`.
- Pour Bizo, Nominatim/OSM donne de meilleurs résultats POI que Mapbox sur cette batterie.

### Overpass

Constats techniques:

- `https://overpass-api.de/api/interpreter` a retourné `406 Not Acceptable` dans notre contexte.
- Le miroir `https://overpass.kumi.systems/api/interpreter` répond correctement en POST.
- Une requête directe par `osm_id` a confirmé l'objet `Ecobank`:

```txt
osm=node:3259902661
name=Ecobank
amenity=bank
atm=yes
coords=6.3599701,2.4353425
```

Périmètre large autour de Cotonou:

```txt
bank: 0 sur première passe large
atm: 0 sur première passe large
pharmacy: 8
fuel: requête lente interrompue
school: requête lente interrompue
```

Exemples pharmacies Overpass trouvées:

```txt
- Pharmacie Le Jourdain | pharmacy | 6.4024688,2.3393859
- Pharmacie Jonquet | pharmacy | 6.3584067,2.4315012
- Pharmacie Marché Vedoko | pharmacy | 6.3781996,2.3902366
- Pharmacie Togoudo | pharmacy | 6.4054126,2.341918
- Pharmacie | pharmacy | 6.3569121,2.4008066
```

Observations:

- Overpass peut servir à importer des catégories OSM, mais les requêtes larges sont lentes.
- Il faut préférer des requêtes ciblées par zone/rayon, catégorie par catégorie, avec timeout et cache.
- Il faut tester un miroir Overpass fiable ou préparer un import depuis extract OSM si on fait du volume.

### Conclusion provisoire Bénin

Classement actuel:

1. Nominatim/OSM pour quartiers et POI précis connus.
2. Overpass pour extraction structurée, mais uniquement avec requêtes contrôlées ou import offline.
3. Mapbox Geocoding pour fallback quartiers/localités.
4. Mapbox Search Box moins convaincant pour POI au Bénin dans cette passe.

Décision recommandée:

- Pour la BDD Bizo au Bénin, commencer par OSM/Nominatim pour villes, quartiers et POI majeurs.
- Utiliser Mapbox comme fallback utilisateur pour les recherches textuelles floues.
- Ne pas dépendre de Mapbox Search Box pour construire les POI Bénin tant que d'autres tests n'améliorent pas les résultats.

## Tests à faire ensuite

## Commandes curl prêtes à tester

Avant les tests:

```bash
export MAPBOX_TOKEN="COLLE_TON_TOKEN_ICI"
```

Si tu es à la racine du backend et que `.env` contient `MAPBOX_TOKEN`, tu peux aussi faire:

```bash
export MAPBOX_TOKEN="$(awk -F= '/^MAPBOX_TOKEN=/{print $2}' .env)"
```

### A. Geocoding v6 — quartiers et villes au Bénin

Objectif: vérifier si Mapbox reconnaît correctement villes/quartiers/localités.

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Fidjrossè Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Akpakpa Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Godomey Abomey-Calavi" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Ganhi Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Version avec sortie lisible si `jq` est installé:

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN" \
| jq '.features[] | {name: .properties.name, full_address: .properties.full_address, type: .properties.feature_type, mapbox_id: .properties.mapbox_id, coordinates: .geometry.coordinates}'
```

### B. Geocoding v6 — POI précis au Bénin

Objectif: vérifier si Geocoding v6 trouve des lieux précis ou seulement la zone.

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=UBA Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Ecobank Ganhi Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Pharmacie Camp Guezo Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
  --data-urlencode "q=Marché Dantokpa Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

### C. Search Box forward — POI précis au Bénin

Objectif: tester la recherche POI plus adaptée que Geocoding v6.

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/forward" \
  --data-urlencode "q=UBA Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/forward" \
  --data-urlencode "q=pharmacie Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/forward" \
  --data-urlencode "q=station service Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Sortie lisible si `jq` est installé:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/forward" \
  --data-urlencode "q=UBA Cadjéhoun Cotonou" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "access_token=$MAPBOX_TOKEN" \
| jq '.features[] | {name: .properties.name, full_address: .properties.full_address, mapbox_id: .properties.mapbox_id, poi_category: .properties.poi_category, coordinates: .geometry.coordinates}'
```

### D. Search Box suggest + retrieve — autocomplete

Objectif: tester le vrai flow autocomplete. `suggest` donne des suggestions, puis `retrieve` récupère le détail d'une suggestion via son `mapbox_id`.

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/suggest" \
  --data-urlencode "q=UBA Cadjéhoun" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=5" \
  --data-urlencode "session_token=test-bizo-location-001" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Après avoir récupéré un `mapbox_id` dans la réponse:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/retrieve/REMPLACE_PAR_MAPBOX_ID" \
  --data-urlencode "session_token=test-bizo-location-001" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

### E. Search Box category — lieux autour d'un point

Objectif: trouver des repères proches autour d'une coordonnée.

Coordonnées approximatives:

```txt
Cadjéhoun Cotonou: longitude=2.3994 latitude=6.361438
Cotonou: longitude=2.4401 latitude=6.373391
```

Banques autour de Cadjéhoun:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/category/bank" \
  --data-urlencode "proximity=2.3994,6.361438" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=10" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Pharmacies autour de Cadjéhoun:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/category/pharmacy" \
  --data-urlencode "proximity=2.3994,6.361438" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=10" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Stations-service autour de Cadjéhoun:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/category/gas_station" \
  --data-urlencode "proximity=2.3994,6.361438" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=10" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

Marchés autour de Cadjéhoun:

```bash
curl -sS -G "https://api.mapbox.com/search/searchbox/v1/category/market" \
  --data-urlencode "proximity=2.3994,6.361438" \
  --data-urlencode "country=bj" \
  --data-urlencode "language=fr" \
  --data-urlencode "limit=10" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

### F. Reverse geocoding

Objectif: partir d'un GPS et récupérer ville/quartier/adresse.

```bash
curl -sS -G "https://api.mapbox.com/search/geocode/v6/reverse" \
  --data-urlencode "longitude=2.3994" \
  --data-urlencode "latitude=6.361438" \
  --data-urlencode "language=fr" \
  --data-urlencode "access_token=$MAPBOX_TOKEN"
```

### G. Batch rapide de tests quartiers au Bénin

```bash
for q in \
  "Cadjéhoun Cotonou" \
  "Fidjrossè Cotonou" \
  "Akpakpa Cotonou" \
  "Ganhi Cotonou" \
  "Godomey Abomey-Calavi"
do
  echo "=== $q ==="
  curl -sS -G "https://api.mapbox.com/search/geocode/v6/forward" \
    --data-urlencode "q=$q" \
    --data-urlencode "country=bj" \
    --data-urlencode "language=fr" \
    --data-urlencode "limit=3" \
    --data-urlencode "access_token=$MAPBOX_TOKEN" \
  | jq -r '.features[]? | "- \(.properties.name // "?") | \(.properties.feature_type // "?") | \(.properties.full_address // "?") | \(.geometry.coordinates)"'
done
```

### H. Batch rapide de tests POI au Bénin

```bash
for q in \
  "UBA Cadjéhoun Cotonou" \
  "Ecobank Ganhi Cotonou" \
  "Pharmacie Camp Guezo Cotonou" \
  "station service Cotonou" \
  "Marché Dantokpa Cotonou"
do
  echo "=== $q ==="
  curl -sS -G "https://api.mapbox.com/search/searchbox/v1/forward" \
    --data-urlencode "q=$q" \
    --data-urlencode "country=bj" \
    --data-urlencode "language=fr" \
    --data-urlencode "limit=3" \
    --data-urlencode "access_token=$MAPBOX_TOKEN" \
  | jq -r '.features[]? | "- \(.properties.name // "?") | \(.properties.poi_category // []) | \(.properties.full_address // "?") | \(.geometry.coordinates)"'
done
```

À noter:

- Les commandes avec `jq` nécessitent `jq`.
- Les coordonnées Mapbox sont généralement dans l'ordre `[longitude, latitude]`.
- Pour `suggest/retrieve`, garder le même `session_token` entre les deux appels.
- Ne pas sauvegarder définitivement les résultats Search Box avant validation des droits Mapbox.

## Commandes curl OSM prêtes à tester

OSM doit rester notre source prioritaire pour enrichir durablement la base Bizo.

Deux outils sont utiles:

- Nominatim: géocodage texte et reverse geocoding.
- Overpass: extraction structurée depuis les tags OSM.

Important:

- Pour Nominatim public, utiliser un `User-Agent` clair.
- Ne pas faire d'autocomplete agressif directement sur Nominatim public.
- Pour les gros imports, préférer Overpass ponctuel, des exports OSM, ou une instance dédiée.
- Si Nominatim retourne `Access denied`, vérifier d'abord le User-Agent et attendre quelques minutes: une IP peut rester temporairement bloquée après plusieurs requêtes refusées.

Avant les tests:

```bash
export BIZO_OSM_USER_AGENT="BizoLocationResearch/1.0 (contact: REMPLACE_PAR_TON_EMAIL_REEL)"
```

Remplace `REMPLACE_PAR_TON_EMAIL_REEL` par un email de contact réel. Ne garde pas `example.com`: Nominatim peut refuser les User-Agent génériques, invalides ou temporaires. Si tu as déjà reçu `Access denied`, attends quelques minutes avant de retester.

Vérifie que la variable est bien remplie:

```bash
echo "$BIZO_OSM_USER_AGENT"
```

Test minimal recommandé:

```bash
curl -i -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "limit=1" \
  --data-urlencode "countrycodes=bj"
```

### A. Nominatim — quartiers et villes au Bénin

Cadjéhoun:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Cadjéhoun Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Fidjrossè:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Fidjrossè Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Akpakpa:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Akpakpa Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Godomey:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Godomey Abomey-Calavi Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Sortie lisible si `jq` est installé:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Cadjéhoun Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj" \
| jq '.[] | {display_name, category, type, osm_type, osm_id, lat, lon, address}'
```

### B. Nominatim — POI précis au Bénin

Banque:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=UBA Cadjéhoun Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Pharmacie:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=pharmacie Cadjéhoun Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

Marché:

```bash
curl -sS -G "https://nominatim.openstreetmap.org/search" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "q=Marché Dantokpa Cotonou Bénin" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "limit=5" \
  --data-urlencode "countrycodes=bj"
```

### C. Nominatim — reverse geocoding

```bash
curl -sS -G "https://nominatim.openstreetmap.org/reverse" \
  --user-agent "$BIZO_OSM_USER_AGENT" \
  --data-urlencode "lat=6.361438" \
  --data-urlencode "lon=2.3994" \
  --data-urlencode "format=jsonv2" \
  --data-urlencode "addressdetails=1" \
  --data-urlencode "zoom=18"
```

### D. Overpass — banques autour de Cadjéhoun

OSM tag principal:

```txt
amenity=bank
```

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["amenity"="bank"](around:3000,6.361438,2.3994);
  way["amenity"="bank"](around:3000,6.361438,2.3994);
  relation["amenity"="bank"](around:3000,6.361438,2.3994);
);
out center tags 20;'
```

Sortie lisible si `jq` est installé:

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["amenity"="bank"](around:3000,6.361438,2.3994);
  way["amenity"="bank"](around:3000,6.361438,2.3994);
  relation["amenity"="bank"](around:3000,6.361438,2.3994);
);
out center tags 20;' \
| jq '.elements[] | {id, type, name: .tags.name, amenity: .tags.amenity, lat: (.lat // .center.lat), lon: (.lon // .center.lon), tags: .tags}'
```

### E. Overpass — pharmacies autour de Cadjéhoun

OSM tag principal:

```txt
amenity=pharmacy
```

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:3000,6.361438,2.3994);
  way["amenity"="pharmacy"](around:3000,6.361438,2.3994);
  relation["amenity"="pharmacy"](around:3000,6.361438,2.3994);
);
out center tags 20;'
```

### F. Overpass — stations-service autour de Cadjéhoun

OSM tag principal:

```txt
amenity=fuel
```

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["amenity"="fuel"](around:3000,6.361438,2.3994);
  way["amenity"="fuel"](around:3000,6.361438,2.3994);
  relation["amenity"="fuel"](around:3000,6.361438,2.3994);
);
out center tags 20;'
```

### G. Overpass — marchés autour de Cotonou

OSM tag principal:

```txt
amenity=marketplace
```

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["amenity"="marketplace"](around:8000,6.373391,2.4401);
  way["amenity"="marketplace"](around:8000,6.373391,2.4401);
  relation["amenity"="marketplace"](around:8000,6.373391,2.4401);
);
out center tags 50;'
```

### H. Overpass — quartiers/localités nommés autour de Cotonou

Tags utiles:

```txt
place=suburb
place=neighbourhood
place=quarter
place=locality
```

```bash
curl -sS -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];
(
  node["place"~"suburb|neighbourhood|quarter|locality"](around:15000,6.373391,2.4401);
  way["place"~"suburb|neighbourhood|quarter|locality"](around:15000,6.373391,2.4401);
  relation["place"~"suburb|neighbourhood|quarter|locality"](around:15000,6.373391,2.4401);
);
out center tags 100;'
```

### I. Overpass — batch catégories utiles autour de Cadjéhoun

```bash
for amenity in bank atm pharmacy fuel school hospital marketplace restaurant
do
  echo "=== amenity=$amenity ==="
  curl -sS -G "https://overpass-api.de/api/interpreter" \
    --data-urlencode "data=[out:json][timeout:25];
(
  node[\"amenity\"=\"$amenity\"](around:3000,6.361438,2.3994);
  way[\"amenity\"=\"$amenity\"](around:3000,6.361438,2.3994);
  relation[\"amenity\"=\"$amenity\"](around:3000,6.361438,2.3994);
);
out center tags 10;" \
  | jq -r '.elements[]? | "- \(.tags.name // "?") | \(.tags.amenity // "?") | \(.lat // .center.lat),\(.lon // .center.lon)"'
done
```

À noter:

- Overpass utilise l'ordre `latitude,longitude` dans `around:rayon,lat,lon`.
- Nominatim retourne souvent `lat` et `lon` comme strings.
- Pour stocker OSM en BDD, garder `osm_type`, `osm_id`, `category/type`, `tags` utiles et `source=osm`.

### 1. Quartiers

```txt
Cadjéhoun Cotonou
Fidjrossè Cotonou
Akpakpa Cotonou
Ganhi Cotonou
Godomey Abomey-Calavi
```

Mesurer:

- nom retourné;
- type retourné;
- pays;
- ville parent;
- coordonnées;
- score de confiance si disponible;
- `mapbox_id`.

### 2. POI précis

```txt
UBA Cadjéhoun Cotonou
Ecobank Ganhi Cotonou
Pharmacie Camp Guezo Cotonou
station service Cotonou
Marché Dantokpa Cotonou
```

Mesurer:

- Search Box trouve-t-il le POI exact ?
- Geocoding v6 trouve-t-il seulement la zone ?
- Le résultat contient-il une catégorie exploitable ?
- Peut-on récupérer un `mapbox_id` stable ?

### 3. Catégories autour d'un point

À tester avec Search Box Category:

```txt
bank
atm
pharmacy
gas_station
hospital
school
market
```

But:

- savoir si Mapbox peut fournir des repères proches autour d'un quartier;
- évaluer la couverture Afrique de l'Ouest;
- décider quelles catégories importer/cache.

## Questions ouvertes

- Peut-on légalement stocker durablement les résultats Mapbox avec notre plan actuel ?
- Search Box couvre-t-il correctement les POI au Bénin ?
- Faut-il garder Mapbox uniquement comme fallback ponctuel et validation manuelle ?
- Faut-il importer OSM en priorité pour tous les POI critiques ?
- Quels départements/villes du Bénin Bizo lance en premier ?

## Recommandation actuelle

Ne pas brancher Mapbox directement dans l'app.

Créer un service backend:

```txt
LocationSearchService
  -> Local database
  -> OSM provider
  -> Mapbox provider
  -> Normalize result
  -> Persist candidate
```

Puis exposer à l'app:

```txt
GET /api/v1/locations/search?q=...
GET /api/v1/locations/cities?country=CI
GET /api/v1/locations/{id}/districts
GET /api/v1/places/search?q=...
```
