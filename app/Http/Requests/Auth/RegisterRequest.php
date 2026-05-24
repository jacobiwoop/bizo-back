<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'display_name' => ['required', 'string', 'max:80'],
            'username' => ['nullable', 'string', 'unique:users,username', 'regex:/^[a-z0-9_]{3,30}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => "L'email est requis.",
            'email.email' => "L'email n'est pas valide.",
            'email.unique' => "Cet email est déjà utilisé.",
            'password.required' => "Le mot de passe est requis.",
            'password.min' => "Le mot de passe doit faire au moins 8 caractères.",
            'password.confirmed' => "La confirmation du mot de passe ne correspond pas.",
            'display_name.required' => "Le nom d'affichage est requis.",
            'display_name.max' => "Le nom d'affichage ne doit pas dépasser 80 caractères.",
            'username.unique' => "Ce nom d'utilisateur est déjà pris.",
            'username.regex' => "Le nom d'utilisateur ne peut contenir que des lettres minuscules, chiffres et underscores (3-30 caractères).",
        ];
    }
}