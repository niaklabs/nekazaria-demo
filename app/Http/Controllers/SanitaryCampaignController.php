<?php

namespace App\Http\Controllers;

use App\Models\SanitaryCampaign;
use Inertia\Inertia;
use Inertia\Response;

class SanitaryCampaignController extends Controller
{
    public function show(SanitaryCampaign $sanitaryCampaign): Response
    {
        $sanitaryCampaign->load(['campaignAnimals.animal', 'exploitation']);

        $animals = $sanitaryCampaign->campaignAnimals->groupBy('status');

        return Inertia::render('normativa/campanas/show', [
            'campaign' => $sanitaryCampaign,
            'animals' => [
                'pending' => $animals->get('pending', collect())->values(),
                'sampled' => $animals->get('sampled', collect())->values(),
                'immobilized' => $animals->get('immobilized', collect())->values(),
            ],
        ]);
    }
}
