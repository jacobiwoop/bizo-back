<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StorageService
{
    private string $disk;

    public function __construct()
    {
        $this->disk = config('filesystems.default', 'local');
    }

    /**
     * Upload et compresse une photo en WebP, retourne l'URL publique.
     */
    public function uploadPhoto(UploadedFile $file, string $path = 'photos'): string
    {
        $filename = pathinfo($file->hashName(), PATHINFO_FILENAME).'.webp';

        $sourceImage = match ($file->getMimeType()) {
            'image/jpeg' => imagecreatefromjpeg($file->getRealPath()),
            'image/png' => imagecreatefrompng($file->getRealPath()),
            'image/webp' => imagecreatefromwebp($file->getRealPath()),
            'image/gif' => imagecreatefromgif($file->getRealPath()),
            default => throw new \InvalidArgumentException('Format d\'image non supporté.'),
        };

        $width = imagesx($sourceImage);
        $height = imagesy($sourceImage);

        if ($width > 1200) {
            $newWidth = 1200;
            $newHeight = (int) round($height * ($newWidth / $width));
            $resampled = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($resampled, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($sourceImage);
            $sourceImage = $resampled;
        }

        $tempPath = sys_get_temp_dir().'/'.$filename;
        imagewebp($sourceImage, $tempPath, 80);
        imagedestroy($sourceImage);

        $storedPath = Storage::disk($this->disk)->putFileAs($path, new UploadedFile($tempPath, $filename, 'image/webp', null, true), $filename);

        @unlink($tempPath);

        return Storage::disk($this->disk)->url($storedPath);
    }

    /**
     * Upload un fichier sans compression.
     */
    public function uploadRaw(UploadedFile $file, string $path = 'avatars'): string
    {
        $storedPath = $file->store($path, $this->disk);

        return Storage::disk($this->disk)->url($storedPath);
    }

    /**
     * Supprime un fichier par son URL.
     */
    public function deleteByUrl(string $url): bool
    {
        $relativePath = parse_url($url, PHP_URL_PATH);
        $relativePath = ltrim(str_replace('/storage/', '', $relativePath), '/');

        if (Storage::disk($this->disk)->exists($relativePath)) {
            return Storage::disk($this->disk)->delete($relativePath);
        }

        return false;
    }

    /**
     * Supprime plusieurs fichiers par leurs URLs.
     */
    public function deleteMany(array $urls): void
    {
        foreach ($urls as $url) {
            $this->deleteByUrl($url);
        }
    }
}