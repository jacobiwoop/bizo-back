<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $listing->title }} - Bizo</title>
    <meta name="description" content="{{ trim(($listing->price ? number_format((int) $listing->price, 0, ',', ' ') . ' FCFA' : 'Prix non renseigne') . ' · ' . $listing->city) }}">
    <meta property="og:title" content="{{ $listing->title }} - Bizo">
    <meta property="og:description" content="{{ trim(($listing->price ? number_format((int) $listing->price, 0, ',', ' ') . ' FCFA' : 'Prix non renseigne') . ' · ' . $listing->city) }}">
    <meta property="og:image" content="{{ $listing->photos[0] ?? ($owner->photo_url ?: 'https://placehold.co/1200x630/png') }}">
    <meta property="og:url" content="{{ route('preview.listing', $listing->id) }}">
    <meta property="og:type" content="website">
    <style>
        :root {
            color-scheme: light;
            --ink: #13212b;
            --muted: #5a6a73;
            --line: #d9e0e3;
            --paper: #f6f2e8;
            --card: #fffdf8;
            --accent: #d6612b;
            --accent-dark: #8b3d1b;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: var(--ink);
            background:
                radial-gradient(circle at top left, rgba(214,97,43,.18), transparent 32%),
                linear-gradient(180deg, #f0eadb 0%, #f7f4ee 100%);
        }
        .shell {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
        }
        .card {
            width: min(980px, 100%);
            background: var(--card);
            border: 1px solid rgba(19,33,43,.08);
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(19,33,43,.12);
        }
        .hero {
            display: grid;
            grid-template-columns: 1.1fr .9fr;
        }
        .image {
            min-height: 360px;
            background: #eee center/cover no-repeat;
        }
        .content {
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            justify-content: center;
        }
        .eyebrow {
            text-transform: uppercase;
            letter-spacing: .18em;
            font-size: 12px;
            color: var(--accent-dark);
        }
        h1 {
            margin: 0;
            font-size: clamp(32px, 4vw, 54px);
            line-height: .98;
        }
        .price {
            font-size: 28px;
            font-weight: 700;
        }
        .meta, .seller, .desc {
            color: var(--muted);
            line-height: 1.6;
        }
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0 18px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 700;
        }
        .button.primary {
            background: var(--accent);
            color: white;
        }
        .button.secondary {
            border: 1px solid var(--line);
            color: var(--ink);
        }
        .footer {
            padding: 20px 32px 32px;
            border-top: 1px solid var(--line);
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            color: var(--muted);
        }
        @media (max-width: 820px) {
            .hero { grid-template-columns: 1fr; }
            .image { min-height: 280px; }
            .content, .footer { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="shell">
        <article class="card">
            <section class="hero">
                <div
                    class="image"
                    style="background-image: url('{{ $listing->photos[0] ?? ($owner->photo_url ?: 'https://placehold.co/1200x900/png') }}');"
                ></div>
                <div class="content">
                    <div class="eyebrow">{{ strtoupper($listing->category) }} · {{ strtoupper($listing->type) }}</div>
                    <h1>{{ $listing->title }}</h1>
                    <div class="price">
                        {{ $listing->price ? number_format((int) $listing->price, 0, ',', ' ') . ' FCFA' : 'Prix non renseigne' }}
                    </div>
                    <div class="meta">{{ $listing->city }}, {{ $listing->country }} · Etat {{ $listing->condition }}</div>
                    <div class="seller">
                        Vendu par <strong>{{ $owner->display_name }}</strong>
                        @if($owner->username)
                            · {{ '@' . $owner->username }}
                        @endif
                    </div>
                    @if($listing->description)
                        <div class="desc">{{ \Illuminate\Support\Str::limit($listing->description, 220) }}</div>
                    @endif
                    <div class="actions">
                        <a class="button primary" href="{{ config('services.android_app.play_store_url', '#') }}">Ouvrir dans l'app</a>
                        @if($owner->username)
                            <a class="button secondary" href="{{ route('preview.seller', $owner->username) }}">Voir le vendeur</a>
                        @endif
                    </div>
                </div>
            </section>
            <footer class="footer">
                <span>Annonce Bizo partagee depuis l'application mobile.</span>
                <span>ID {{ $listing->id }}</span>
            </footer>
        </article>
    </div>
</body>
</html>
