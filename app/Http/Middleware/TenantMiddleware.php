<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = 1;

        if (auth()->check()) {
            $tenantId = auth()->user()->tenant_id;
        }

        // Store tenant ID in session
        session(['tenant_id' => $tenantId]);

        // Validate active tenant status
        $tenant = Tenant::find($tenantId);
        if (!$tenant || $tenant->status !== 'active') {
            abort(403, 'Your organization account is inactive or suspended.');
        }

        return $next($request);
    }
}
