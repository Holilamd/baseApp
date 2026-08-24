<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Branch;

class CheckBranchOperational
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // If user doesn't have a branch (e.g. super admin), bypass or check specific branch in request?
        // Usually, teller has a branch_id. If a teller tries to transact, we check their branch.
        if ($user && $user->branch_id) {
            $branch = Branch::find($user->branch_id);
            
            if (!$branch || $branch->operational_status !== 'OPEN') {
                return redirect()->back()->withErrors([
                    'operational_status' => 'Transaksi ditolak. Status cabang Anda saat ini sedang TUTUP (CLOSED). Silakan lakukan proses Buka Cabang (Start of Day) terlebih dahulu.'
                ]);
            }
        }

        return $next($request);
    }
}
