<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réinitialiser le mot de passe - Bizo</title>
    <style>
        :root {
            color-scheme: light;
            --ink: #12212c;
            --muted: #60717b;
            --line: #d9e0e4;
            --paper: #f4efe4;
            --card: #fffdf8;
            --accent: #cf5c28;
            --accent-dark: #8f3d1b;
            --danger-bg: #fdecec;
            --danger-ink: #9b1c1c;
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
            width: min(560px, 100%);
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
            color: var(--accent-dark);
        }
        h1 {
            margin: 10px 0 12px;
            font-size: clamp(32px, 5vw, 46px);
            line-height: 1;
        }
        .lead {
            margin: 0 0 24px;
            color: var(--muted);
            line-height: 1.6;
        }
        .alert {
            border-radius: 16px;
            padding: 14px 16px;
            margin-bottom: 18px;
            line-height: 1.5;
        }
        .alert.error {
            background: var(--danger-bg);
            color: var(--danger-ink);
        }
        .field {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        label {
            font-weight: 700;
            font-size: 15px;
        }
        input {
            width: 100%;
            min-height: 52px;
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 0 16px;
            font: inherit;
            color: var(--ink);
            background: white;
        }
        input:focus {
            outline: 2px solid rgba(207,92,40,.2);
            border-color: var(--accent);
        }
        .help {
            color: var(--muted);
            font-size: 14px;
        }
        .password-wrap {
            position: relative;
        }
        .password-wrap input {
            padding-right: 52px;
        }
        .password-toggle {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: var(--muted);
            cursor: pointer;
            font-size: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .password-toggle:hover {
            background: rgba(18,33,44,.06);
            color: var(--ink);
        }
        .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 24px;
        }
        button, .link {
            min-height: 50px;
            border-radius: 999px;
            padding: 0 18px;
            text-decoration: none;
            font-weight: 700;
            font: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        button {
            border: 0;
            background: var(--accent);
            color: white;
            cursor: pointer;
        }
        .link {
            border: 1px solid var(--line);
            color: var(--ink);
            background: transparent;
        }
        .footer {
            margin-top: 24px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="shell">
        <main class="card">
            <div class="eyebrow">Bizo</div>
            <h1>Réinitialiser le mot de passe</h1>
            <p class="lead">Choisissez un nouveau mot de passe pour retrouver l'accès à votre compte, même si vous n'avez pas l'application sous la main.</p>

            @if ($errors->any())
                <div class="alert error">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="post" action="{{ route('password.update.web') }}">
                @csrf
                <input type="hidden" name="token" value="{{ old('token', $token) }}">

                <div class="field">
                    <label for="email">Adresse email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        value="{{ old('email', $email) }}"
                        required
                    >
                </div>

                <div class="field">
                    <label for="password">Nouveau mot de passe</label>
                    <div class="password-wrap">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                        >
                        <button type="button" class="password-toggle" data-target="password" aria-label="Afficher le mot de passe" aria-pressed="false">👁</button>
                    </div>
                    <div class="help">Minimum 8 caractères.</div>
                </div>

                <div class="field">
                    <label for="password_confirmation">Confirmer le mot de passe</label>
                    <div class="password-wrap">
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            autocomplete="new-password"
                            required
                        >
                        <button type="button" class="password-toggle" data-target="password_confirmation" aria-label="Afficher le mot de passe" aria-pressed="false">👁</button>
                    </div>
                </div>

                <div class="actions">
                    <button type="submit">Mettre à jour le mot de passe</button>
                    <a class="link" href="{{ url('/') }}">Retour</a>
                </div>
            </form>

            <div class="footer">
                Si le lien a expiré, recommencez la demande de réinitialisation depuis l'application ou l'écran de connexion.
            </div>
        </main>
    </div>
    <script>
        document.querySelectorAll('.password-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const input = document.getElementById(button.dataset.target);
                const isHidden = input.type === 'password';
                input.type = isHidden ? 'text' : 'password';
                button.textContent = isHidden ? '🙈' : '👁';
                button.setAttribute('aria-label', isHidden ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
                button.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
            });
        });
    </script>
</body>
</html>
