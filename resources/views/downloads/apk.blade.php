<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bizo Android APK</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f3efe7;
            --card: #fffdf8;
            --ink: #111111;
            --muted: #6f6a62;
            --line: #ddd2c2;
            --accent: #111111;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            background:
                radial-gradient(circle at top right, #efe4d1 0, transparent 28%),
                linear-gradient(180deg, #f8f3eb 0%, var(--bg) 100%);
            color: var(--ink);
            min-height: 100vh;
        }
        .wrap {
            max-width: 760px;
            margin: 0 auto;
            padding: 40px 20px 64px;
        }
        .hero {
            display: grid;
            gap: 18px;
            margin-bottom: 28px;
        }
        h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3.2rem);
            line-height: 0.96;
            letter-spacing: -0.05em;
        }
        p {
            margin: 0;
            color: var(--muted);
            line-height: 1.6;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 14px 42px rgba(24, 18, 10, 0.07);
        }
        .stack {
            display: grid;
            gap: 18px;
        }
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin: 0 0 28px;
        }
        .meta-item {
            padding: 14px 16px;
            border-radius: 16px;
            background: #f6f0e5;
            border: 1px solid #e6dac7;
        }
        .label {
            display: block;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
            margin-bottom: 6px;
        }
        .value {
            font-size: 1rem;
            font-weight: 700;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 52px;
            padding: 0 20px;
            border-radius: 999px;
            background: var(--accent);
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            border: 0;
            cursor: pointer;
        }
        .btn-secondary {
            background: #e8ddcc;
            color: var(--ink);
        }
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }
        .flash {
            padding: 14px 16px;
            border-radius: 16px;
            font-weight: 600;
        }
        .flash-ok {
            background: #ecf7ef;
            color: #14532d;
            border: 1px solid #b9e1c2;
        }
        .flash-error {
            background: #fff0ee;
            color: #8a1c12;
            border: 1px solid #efc0b9;
        }
        .field {
            display: grid;
            gap: 8px;
        }
        .field input {
            min-height: 48px;
            border-radius: 14px;
            border: 1px solid var(--line);
            background: #fff;
            padding: 0 14px;
            font: inherit;
        }
        .log {
            white-space: pre-wrap;
            background: #151515;
            color: #f4f1ea;
            border-radius: 18px;
            padding: 16px;
            font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
            overflow: auto;
            max-height: 420px;
        }
        .subcard {
            padding-top: 18px;
            border-top: 1px solid var(--line);
        }
        .empty {
            display: grid;
            gap: 12px;
        }
    </style>
</head>
<body>
<div class="wrap">
    <section class="hero">
        <h1>Telecharger l’APK Android Bizo</h1>
        <p>Cette page expose le dernier build debug genere sur le serveur et stocke dans le volume <code>bizo-storage</code>.</p>
    </section>

    <section class="card stack">
        @if(session('build_success'))
            <div class="flash flash-ok">{{ session('build_success') }}</div>
        @endif

        @if(session('build_error'))
            <div class="flash flash-error">{{ session('build_error') }}</div>
        @endif

        @if($showBuildLogin)
            <form method="post" action="{{ route('downloads.android.authorize') }}" class="stack">
                @csrf
                <div class="field">
                    <label for="token"><strong>Token build</strong></label>
                    <input id="token" name="token" type="password" value="{{ old('token') }}" placeholder="Entrer le token admin de build">
                </div>
                <div class="actions">
                    <button class="btn" type="submit">Activer le mode build</button>
                </div>
            </form>
        @endif

        @if($buildStatus['log_updated_at'])
            <div class="subcard stack">
                <div>
                    <strong>Dernier log build</strong><br>
                    <span class="label" style="margin:8px 0 0;">Mis a jour le {{ $buildStatus['log_updated_at']->setTimezone(config('app.timezone'))->format('d/m/Y H:i:s') }}</span>
                </div>
                @if($buildStatus['log_tail'])
                    <div class="log">{{ $buildStatus['log_tail'] }}</div>
                @endif
            </div>
        @endif

        @if($showBuildControls)
            <div class="subcard stack">
                <div class="actions">
                    <form method="post" action="{{ route('downloads.android.build') }}">
                        @csrf
                        <button class="btn" type="submit">Lancer un nouveau build APK</button>
                    </form>
                    <form method="post" action="{{ route('downloads.android.logout') }}">
                        @csrf
                        <button class="btn btn-secondary" type="submit">Quitter le mode build</button>
                    </form>
                </div>
            </div>
        @endif

        @if($build)
            <div class="subcard">
                <div class="meta">
                    <div class="meta-item">
                        <span class="label">Version</span>
                        <span class="value">{{ $build['version'] ?? 'n/a' }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Version Code</span>
                        <span class="value">{{ $build['version_code'] ?? 'n/a' }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Git SHA</span>
                        <span class="value">{{ $build['git_sha'] ?? 'n/a' }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Taille</span>
                        <span class="value">{{ $build['size_mb'] }} MB</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">Build</span>
                        <span class="value">{{ $build['built_at']->setTimezone(config('app.timezone'))->format('d/m/Y H:i') }}</span>
                    </div>
                </div>

                <div class="actions">
                    <a class="btn" href="{{ route('downloads.android.latest') }}">Telecharger le dernier APK</a>
                    <a class="btn btn-secondary" href="{{ route('downloads.android') }}">Rafraichir la page</a>
                </div>
            </div>
        @else
            <div class="empty subcard">
                <strong>Aucun APK disponible pour le moment.</strong>
                <p>Lance d’abord le script de build Android sur le serveur pour publier un APK dans <code>bizo-storage/mobile-builds/latest</code>.</p>
            </div>
        @endif
    </section>
</div>
</body>
</html>
