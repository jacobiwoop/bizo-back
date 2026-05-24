<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:80'],
            'description' => ['required', 'string', 'min:20', 'max:500'],
            'type' => ['required', 'string', 'in:VENTE,TROC,TROC_CASH'],
            'price' => ['required_if:type,VENTE', 'nullable', 'integer', 'min:0'],
            'cash_complement' => ['nullable', 'integer', 'min:0'],
            'exchange_for' => ['required_if:type,TROC,TROC_CASH', 'nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:50'],
            'condition' => ['required', 'string', 'in:neuf,excellent,bon,correct'],
            'delivery_mode' => ['required', 'string', 'in:main_propre,livraison,les_deux'],
            'country' => ['required', 'string', 'max:5'],
            'city' => ['required', 'string', 'max:80'],
            'neighborhood' => ['nullable', 'string', 'max:80'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:30'],
            'photos' => ['required', 'array', 'min:1', 'max:10'],
            'photos.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:15360'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est requis.',
            'title.min' => 'Le titre doit faire au moins 5 caractères.',
            'title.max' => 'Le titre ne doit pas dépasser 80 caractères.',
            'description.required' => 'La description est requise.',
            'description.min' => 'La description doit faire au moins 20 caractères.',
            'description.max' => 'La description ne doit pas dépasser 500 caractères.',
            'type.required' => 'Le type est requis (VENTE, TROC ou TROC_CASH).',
            'type.in' => 'Le type doit être VENTE, TROC ou TROC_CASH.',
            'price.required_if' => 'Le prix est requis pour une vente.',
            'price.integer' => 'Le prix doit être un nombre entier.',
            'exchange_for.required_if' => 'Vous devez préciser ce que vous cherchez en échange.',
            'category.required' => 'La catégorie est requise.',
            'condition.required' => 'L\'état est requis.',
            'condition.in' => 'L\'état doit être neuf, excellent, bon ou correct.',
            'delivery_mode.required' => 'Le mode de livraison est requis.',
            'delivery_mode.in' => 'Mode de livraison invalide.',
            'country.required' => 'Le pays est requis.',
            'city.required' => 'La ville est requise.',
            'photos.required' => 'Au moins une photo est requise.',
            'photos.min' => 'Au moins une photo est requise.',
            'photos.max' => 'Maximum 10 photos autorisées.',
            'photos.*.image' => 'Chaque fichier doit être une image.',
            'photos.*.mimes' => 'Formats acceptés : jpg, jpeg, png, webp.',
            'photos.*.max' => 'Chaque photo ne doit pas dépasser 15 Mo.',
        ];
    }
}
