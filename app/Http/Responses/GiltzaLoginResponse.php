<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class GiltzaLoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return Response
     */
    public function toResponse($request): JsonResponse|Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        return redirect()->intended(route('auth.giltza'));
    }
}
