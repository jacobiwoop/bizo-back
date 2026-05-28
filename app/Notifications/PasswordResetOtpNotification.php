<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $otp,
        public readonly int $expiresInMinutes = 10,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Code de réinitialisation Bizo')
            ->greeting('Bonjour,')
            ->line('Voici votre code pour réinitialiser votre mot de passe Bizo :')
            ->line($this->otp)
            ->line("Ce code expire dans {$this->expiresInMinutes} minutes.")
            ->line("Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.");
    }
}
