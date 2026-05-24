<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $seller->display_name }} - Bizo</title>
    <meta name="description" content="{{ $seller->bio ?: 'Profil vendeur Bizo' }}">
    <meta property="og:title" content="{{ $seller->display_name }} - Bizo">
    <meta property="og:description" content="{{ $seller->bio ?: 'Profil vendeur Bizo' }}">
    <meta property="og:image" content="{{ $seller->photo_url ?: 'https://placehold.co/1200x630/png' }}">
    <meta property="og:url" content="{{ route('preview.seller', $seller->username) }}">
    <meta property="og:type" content="profile">
    <style>
        :root {
            --ink: #101c26;
            --muted: #5d6c76;
            --paper: #f4f6f8;
            --card: #ffffff;
            --line: #d9e2e8;
            --accent: #146c68;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Trebuchet MS", Verdana, sans-serif;
            color: var(--ink);
            background:
                linear-gradient(140deg, rgba(20,108,104,.12), transparent 28%),
                linear-gradient(180deg, #eef3f4 0%, #f8fafb 100%);
        }
        .page {
            width: min(1100px, calc(100% - 32px));
            margin: 24px auto 48px;
        }
        .hero {
            background: var(--card);
            border: 1px solid rgba(16,28,38,.08);
            border-radius: 28px;
            padding: 28px;
            box-shadow: 0 16px 40px rgba(16,28,38,.08);
        }
        .profile {
            display: grid;
            grid-template-columns: 96px 1fr;
            gap: 20px;
            align-items: center;
        }
        .avatar {
            width: 96px;
            height: 96px;
            border-radius: 24px;
            background: #dce7ea center/cover no-repeat;
        }
        h1 {
            margin: 0 0 8px;
            font-size: clamp(28px, 4vw, 48px);
        }
        .handle, .bio {
            color: var(--muted);
        }
        .stats {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .stat {
            padding: 12px 16px;
            border-radius: 18px;
            background: #f5f9fa;
            border: 1px solid var(--line);
        }
        .section-title {
            margin: 28px 4px 16px;
            font-size: 13px;
            letter-spacing: .16em;
            text-transform: uppercase;
            color: var(--accent);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
        }
        .listing {
            background: var(--card);
            border: 1px solid rgba(16,28,38,.08);
            border-radius: 22px;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            box-shadow: 0 10px 24px rgba(16,28,38,.06);
        }
        .listing-image {
            aspect-ratio: 4 / 3;
            background: #dce7ea center/cover no-repeat;
        }
        .listing-body {
            padding: 16px;
        }
        .listing-title {
            margin: 0 0 8px;
            font-size: 20px;
        }
        .listing-meta {
            color: var(--muted);
            font-size: 14px;
        }
        .cta {
            margin-top: 20px;
            display: inline-flex;
            min-height: 48px;
            align-items: center;
            padding: 0 18px;
            border-radius: 999px;
            text-decoration: none;
            background: var(--accent);
            color: white;
            font-weight: 700;
        }
        @media (max-width: 920px) {
            .grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
            .page { width: min(100% - 20px, 1100px); }
            .hero { padding: 20px; }
            .profile { grid-template-columns: 72px 1fr; }
            .avatar { width: 72px; height: 72px; border-radius: 18px; }
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <main class="page">
        <section class="hero">
            <div class="profile">
                <div
                    class="avatar"
                    style="background-image: url('{{ $seller->photo_url ?: 'https://placehold.co/400x400/png' }}');"
                ></div>
                <div>
                    <h1>{{ $seller->display_name }}</h1>
                    <div class="handle">{{ '@' . $seller->username }}</div>
                    @if($seller->bio)
                        <p class="bio">{{ $seller->bio }}</p>
                    @endif
                    <div class="stats">
                        <div class="stat">{{ $seller->rating ? number_format($seller->rating, 1, ',', ' ') : '0,0' }} / 5</div>
                        <div class="stat">{{ $seller->review_count }} avis</div>
                        <div class="stat">{{ $seller->total_sales }} ventes</div>
                        <div class="stat">{{ $listings->count() }} annonces visibles</div>
                    </div>
                    <a class="cta" href="{{ config('services.android_app.play_store_url', '#') }}">Continuer dans l'app</a>
                </div>
            </div>
        </section>

        <div class="section-title">Annonces en ligne</div>

        <section class="grid">
            @forelse($listings as $listing)
                <a class="listing" href="{{ route('preview.listing', $listing->id) }}">
                    <div
                        class="listing-image"
                        style="background-image: url('{{ $listing->photos[0] ?? 'https://placehold.co/800x600/png' }}');"
                    ></div>
                    <div class="listing-body">
                        <h2 class="listing-title">{{ $listing->title }}</h2>
                        <div class="listing-meta">
                            {{ $listing->price ? number_format((int) $listing->price, 0, ',', ' ') . ' FCFA' : 'Prix non renseigne' }}
                            · {{ $listing->city }}
                        </div>
                    </div>
                </a>
            @empty
                <div class="listing">
                    <div class="listing-body">
                        <h2 class="listing-title">Aucune annonce active</h2>
                        <div class="listing-meta">Ce vendeur n'a pas d'annonce visible pour le moment.</div>
                    </div>
                </div>
            @endforelse
        </section>
    </main>
</body>
</html>
