<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $userName = $request->user()->name;
        $firstName = explode(' ', trim($userName))[0];

        return Inertia::render('home', [
            'firstName' => $firstName,
        ]);
    }
}
