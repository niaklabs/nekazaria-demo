<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBirthRegistrationRequest;
use App\Models\Animal;
use App\Models\BirthRegistration;
use App\Models\SubExploitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BirthRegistrationController extends Controller
{
    public function create(Request $request): Response
    {
        $exploitation = $request->user()
            ->exploitations()
            ->with(['subExploitations.animals'])
            ->firstOrFail();

        return Inertia::render('nacimientos/crear', [
            'exploitation' => $exploitation,
        ]);
    }

    public function store(StoreBirthRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $subExploitation = SubExploitation::findOrFail($validated['sub_exploitation_id']);
        $mother = Animal::findOrFail($validated['mother_id']);

        return DB::transaction(function () use ($validated, $subExploitation, $mother): RedirectResponse {
            $referenceCode = $this->generateReferenceCode();

            $birthRegistration = BirthRegistration::create([
                'sub_exploitation_id' => $validated['sub_exploitation_id'],
                'mother_id' => $validated['mother_id'],
                'father_id' => $validated['father_id'] ?? null,
                'birth_type' => $validated['birth_type'],
                'calf_count' => count($validated['calves']),
                'status' => 'submitted',
                'submitted_at' => now(),
                'reference_code' => $referenceCode,
            ]);

            $createdCalves = [];

            foreach ($validated['calves'] as $calfData) {
                $assignedCrotal = $this->generateCrotalCode();

                $calf = $birthRegistration->calves()->create([
                    'sex' => $calfData['sex'],
                    'breed' => $calfData['breed'],
                    'name' => $calfData['name'] ?? null,
                    'birth_date' => $calfData['birth_date'],
                    'assigned_crotal' => $assignedCrotal,
                ]);

                Animal::create([
                    'sub_exploitation_id' => $subExploitation->id,
                    'crotal_code' => $assignedCrotal,
                    'species' => $subExploitation->species,
                    'breed' => $calfData['breed'],
                    'sex' => $calfData['sex'],
                    'name' => $calfData['name'] ?? null,
                    'birth_date' => $calfData['birth_date'],
                    'mother_id' => $mother->id,
                    'father_id' => $validated['father_id'] ?? null,
                    'status' => 'active',
                ]);

                $createdCalves[] = [
                    'name' => $calfData['name'] ?? null,
                    'sex' => $calfData['sex'],
                    'crotal' => $assignedCrotal,
                ];
            }

            $subExploitation->increment('current_capacity', count($validated['calves']));

            return redirect()->route('nacimientos.create')->with('success', [
                'message' => 'Nacimiento registrado correctamente.',
                'reference_code' => $referenceCode,
                'calves' => $createdCalves,
                'new_capacity' => $subExploitation->fresh()->current_capacity,
            ]);
        });
    }

    /**
     * Generate a mock reference code in format NC-2026-048-XXXXX.
     */
    private function generateReferenceCode(): string
    {
        $year = now()->year;
        $sequence = str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);

        return "NC-{$year}-048-{$sequence}";
    }

    /**
     * Generate a mock crotal code in format ES + 13 digits.
     */
    private function generateCrotalCode(): string
    {
        $digits = str_pad((string) random_int(0, 9999999999999), 13, '0', STR_PAD_LEFT);

        return "ES{$digits}";
    }
}
