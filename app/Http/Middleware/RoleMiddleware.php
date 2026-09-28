<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Cek apakah role user saat ini ada dalam daftar role yang dizinkan
        if (!in_array($user->role, $roles)) {
            // Jika kasir mencoba akses area owner, lempar balik ke POS
            if ($user->role === 'cashier') {
                return redirect()->route('pos.index')->with('error', 'Akses ditolak! Anda tidak memiliki izin ke halaman tersebut.');
            }

            abort(403, 'Akses Ditolak');
        }

        return $next($request);
    }
}