<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2'],
            'category' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'in:VENTE,TROC,TROC_CASH'],
            'city' => ['nullable', 'string', 'max:80'],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'condition' => ['nullable', 'string', 'in:neuf,excellent,bon,correct'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $queryTerm = mb_strtolower($validated['q']);

        $query = Listing::active()
            ->with('owner')
            ->where(function ($query) use ($queryTerm) {
                $query->where('title_search', 'like', "%{$queryTerm}%")
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$queryTerm}%"]);
            })
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->city, fn ($q, $v) => $q->where('city', 'like', "%{$v}%"))
            ->when($request->condition, fn ($q, $v) => $q->where('condition', $v))
            ->when($request->min_price, fn ($q, $v) => $q->where('price', '>=', $v))
            ->when($request->max_price, fn ($q, $v) => $q->where('price', '<=', $v))
            ->orderByRaw('CASE WHEN title_search LIKE ? THEN 0 ELSE 1 END', ["{$queryTerm}%"])
            ->orderByDesc('is_boosted')
            ->orderByDesc('created_at');

        $results = $query->paginate($request->integer('per_page', 20));

        return ListingResource::collection($results);
    }
}
