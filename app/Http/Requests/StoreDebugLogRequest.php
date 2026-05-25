<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDebugLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'app' => ['nullable', 'array'],
            'device' => ['nullable', 'array'],
            'context' => ['nullable', 'array'],
            'logs' => ['required', 'array', 'min:1'],
            'logs.*' => ['required', 'array'],
            'logs.*.timestamp' => ['nullable', 'string', 'max:100'],
            'logs.*.level' => ['nullable', 'string', 'max:50'],
            'logs.*.category' => ['nullable', 'string', 'max:100'],
            'logs.*.title' => ['nullable', 'string', 'max:255'],
            'logs.*.details' => ['nullable'],
        ];
    }
}
