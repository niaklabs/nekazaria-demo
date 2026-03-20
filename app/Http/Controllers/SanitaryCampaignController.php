<?php

namespace App\Http\Controllers;

use App\Models\SanitaryCampaign;
use Inertia\Inertia;
use Inertia\Response;

class SanitaryCampaignController extends Controller
{
    public function index(): Response
    {
        $exploitation = auth()->user()->exploitation;

        $campaigns = SanitaryCampaign::query()
            ->where('exploitation_id', $exploitation->id)
            ->with('campaignAnimals.animal')
            ->get();

        $immobilizedAnimals = $campaigns
            ->flatMap(fn (SanitaryCampaign $c) => $c->campaignAnimals
                ->where('status', 'immobilized')
                ->map(fn ($ca) => $ca->setAttribute('campaign_name', $c->name)->setAttribute('campaign_id', $c->id)))
            ->groupBy(fn ($ca) => $ca->animal->species.'|'.($ca->restriction_type ?? 'blocked'));

        return Inertia::render('normativa/campanas/index', [
            'campaigns' => $campaigns,
            'immobilizedAnimals' => $immobilizedAnimals,
        ]);
    }

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
