<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_type' => ['required', 'string', 'in:listing,user,message'],
            'target_id' => ['required', 'string'],
            'reason' => ['required', 'string', 'in:spam,fake,inappropriate,scam'],
        ]);

        $report = Report::create([
            'from_uid' => $request->user()->id,
            'target_type' => $validated['target_type'],
            'target_id' => $validated['target_id'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => new ReportResource($report),
        ], 201);
    }
}
