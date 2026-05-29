export type ListingCategoryId = "telephones" | "electronique" | "vehicules" | "vetements" | "maison" | "services";

export type ListingCategoryIcon = "phone" | "electronics" | "vehicle" | "fashion" | "home" | "service";

export type ListingAttributeField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type ListingCategoryDefinition = {
  id: ListingCategoryId;
  label: string;
  icon: ListingCategoryIcon;
  fields: ListingAttributeField[];
};

export const listingCategories: ListingCategoryDefinition[] = [
  {
    id: "telephones",
    label: "Téléphones",
    icon: "phone",
    fields: [
      { key: "brand", label: "Marque", type: "text", required: true, placeholder: "Ex: Apple" },
      { key: "model", label: "Modèle", type: "text", required: true, placeholder: "Ex: iPhone 13 Pro" },
      { key: "storage", label: "Stockage", type: "select", options: ["32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To"] },
      { key: "ram", label: "RAM", type: "select", options: ["2 Go", "3 Go", "4 Go", "6 Go", "8 Go", "12 Go", "16 Go"] },
      { key: "battery_health", label: "État batterie (%)", type: "number", placeholder: "Ex: 88" },
      { key: "sim_type", label: "SIM", type: "select", options: ["Simple SIM", "Double SIM", "eSIM", "Double SIM + eSIM"] },
      { key: "warranty", label: "Garantie", type: "select", options: ["Oui", "Non"] },
    ],
  },
  {
    id: "electronique",
    label: "Électronique",
    icon: "electronics",
    fields: [
      { key: "device_type", label: "Type d'appareil", type: "text", required: true, placeholder: "Ex: ordinateur portable" },
      { key: "brand", label: "Marque", type: "text", placeholder: "Ex: HP" },
      { key: "model", label: "Modèle", type: "text", placeholder: "Ex: EliteBook" },
      { key: "power_source", label: "Alimentation", type: "select", options: ["Batterie", "Secteur", "Pile", "Solaire"] },
      { key: "connectivity", label: "Connectivité", type: "multiselect", options: ["Wi-Fi", "Bluetooth", "USB-C", "HDMI", "4G/5G"] },
      { key: "warranty", label: "Garantie", type: "select", options: ["Oui", "Non"] },
    ],
  },
  {
    id: "vehicules",
    label: "Véhicules",
    icon: "vehicle",
    fields: [
      { key: "brand", label: "Marque", type: "text", required: true, placeholder: "Ex: Toyota" },
      { key: "model", label: "Modèle", type: "text", required: true, placeholder: "Ex: Corolla" },
      { key: "year", label: "Année", type: "number", placeholder: "Ex: 2018" },
      { key: "mileage", label: "Kilométrage", type: "number", placeholder: "Ex: 85000" },
      { key: "fuel", label: "Carburant", type: "select", options: ["Essence", "Diesel", "Hybride", "Électrique"] },
      { key: "transmission", label: "Boîte", type: "select", options: ["Manuelle", "Automatique"] },
    ],
  },
  {
    id: "vetements",
    label: "Vêtements",
    icon: "fashion",
    fields: [
      { key: "brand", label: "Marque", type: "text", placeholder: "Ex: Nike" },
      { key: "size", label: "Taille", type: "text", required: true, placeholder: "Ex: M, 42, XL" },
      { key: "gender", label: "Genre", type: "select", options: ["Homme", "Femme", "Enfant", "Unisexe"] },
      { key: "color", label: "Couleur", type: "text", placeholder: "Ex: noir" },
      { key: "material", label: "Matière", type: "text", placeholder: "Ex: coton" },
    ],
  },
  {
    id: "maison",
    label: "Maison",
    icon: "home",
    fields: [
      { key: "item_type", label: "Type d'objet", type: "text", required: true, placeholder: "Ex: canapé" },
      { key: "brand", label: "Marque", type: "text", placeholder: "Ex: Ikea" },
      { key: "material", label: "Matière", type: "text", placeholder: "Ex: bois" },
      { key: "dimensions", label: "Dimensions", type: "text", placeholder: "Ex: 180 x 90 cm" },
      { key: "room", label: "Pièce", type: "select", options: ["Salon", "Chambre", "Cuisine", "Bureau", "Extérieur"] },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "service",
    fields: [
      { key: "service_type", label: "Type de service", type: "text", required: true, placeholder: "Ex: réparation téléphone" },
      { key: "availability", label: "Disponibilité", type: "text", placeholder: "Ex: week-end" },
      { key: "experience_years", label: "Années d'expérience", type: "number", placeholder: "Ex: 3" },
      { key: "zone", label: "Zone d'intervention", type: "text", placeholder: "Ex: Cocody" },
      { key: "pricing_unit", label: "Tarif par", type: "select", options: ["Prestation", "Heure", "Jour", "Devis"] },
    ],
  },
];

export function getListingCategory(id: ListingCategoryId): ListingCategoryDefinition {
  return listingCategories.find((category) => category.id === id) ?? listingCategories[0];
}
