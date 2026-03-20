<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $firstName = explode(' ', trim($user->name))[0];

        return Inertia::render('home', [
            'firstName' => $firstName,
            'avatar' => $user->avatar,
        ]);
    }
}
