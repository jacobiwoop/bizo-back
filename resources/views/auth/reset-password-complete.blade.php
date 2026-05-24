<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mot de passe réinitialisé - Bizo</title>
    <style>
        :root {
            color-scheme: light;
            --ink: #12212c;
            --muted: #60717b;
            --line: #d9e0e4;
            --card: #fffdf8;
            --accent: #cf5c28;
            --ok-bg: #eaf7ee;
            --ok-ink: #18643c;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: Georgia, "Times New Roman", serif;
            color: var(--ink);
            background:
                radial-gradient(circle at top left, rgba(207,92,40,.18), transparent 30%),
                linear-gradient(180deg, #efe7d8 0%, #f8f5ef 100%);
        }
        .shell {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
        }
        .card {
            width: min(540px, 100%);
            background: var(--card);
            border: 1px solid rgba(18,33,44,.08);
            border-radius: 28px;
            box-shadow: 0 24px 60px rgba(18,33,44,.12);
            padding: 32px;
        }
        .eyebrow {
            text-transform: uppercase;
            letter-spacing: .18em;
            font-size: 12px;
            color: var(--accent);
        }
        h1 {
            margin: 10px 0 14px;
            font-size: clamp(30px, 5vw, 44px);
            line-height: 1;
        }
        p {
            margin: 0 0 16px;
            color: var(--muted);
            line-height: 1.6;
        }
        .notice {
            background: var(--ok-bg);
            color: var(--ok-ink);
            border-radius: 16px;
            padding: 16px;
            margin: 18px 0 24px;
            font-weight: 700;
        }
        .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        .button {
            min-height: 50px;
            border-radius: 999px;
            padding: 0 18px;
            text-decoration: none;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .button.primary {
            background: var(--accent);
            color: white;
        }
        .button.secondary {
            border: 1px solid var(--line);
            color: var(--ink);
        }
    </style>
</head>
<body>
    <div class="shell">
        <main class="card">
            <div class="eyebrow">Bizo</div>
            <h1>Mot de passe mis à jour</h1>
            <div class="notice">Votre mot de passe a été réinitialisé avec succès.</div>
            <p>Vous pouvez maintenant vous reconnecter depuis l'application mobile avec votre nouveau mot de passe.</p>
            <div class="actions">
                <a class="button primary" href="{{ url('/') }}">Retour à l'accueil</a>
                <a class="button secondary" href="{{ config('services.android_app.play_store_url', '#') }}">Ouvrir l'application</a>
            </div>
        </main>
    </div>
</body>
</html>
