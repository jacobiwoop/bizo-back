<?php

namespace App\Support;

use Illuminate\Support\Str;

class ListingCategory
{
    public const ELECTRONIQUE = 'electronique';
    public const VETEMENTS = 'vetements';
    public const VEHICULES = 'vehicules';
    public const MAISON = 'maison';
    public const SERVICES = 'services';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::ELECTRONIQUE,
            self::VETEMENTS,
            self::VEHICULES,
            self::MAISON,
            self::SERVICES,
        ];
    }

    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = Str::of($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->trim('_')
            ->value();

        return match ($normalized) {
            'electronique', 'electroniques', 'electro', 'high_tech', 'tech' => self::ELECTRONIQUE,
            'vetement', 'vetements', 'vêtement', 'vêtements', 'mode', 'fashion' => self::VETEMENTS,
            'vehicule', 'vehicules', 'automobile', 'auto', 'moto', 'transport' => self::VEHICULES,
            'maison', 'home', 'mobilier', 'deco', 'decoration' => self::MAISON,
            'service', 'services', 'prestation', 'prestations' => self::SERVICES,
            default => $normalized,
        };
    }
}
