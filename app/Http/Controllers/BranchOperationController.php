<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Branch;

class BranchOperationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $query = Branch::where('tenant_id', $user->tenant_id);
        
        if ($user->branch_id) {
            $query->where('id', $user->branch_id);
        }

        $branches = $query->get();

        return Inertia::render('BranchOperations/Index', [
            'branches' => $branches
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        if ($branch->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        if (auth()->user()->branch_id && $branch->id !== auth()->user()->branch_id) {
            abort(403);
        }

        $validated = $request->validate([
            'operational_status' => 'required|in:OPEN,CLOSED',
            'operational_date' => 'nullable|date',
        ]);

        $branch->update($validated);

        return redirect()->back()->with('success', 'Status operasional cabang berhasil diperbarui.');
    }
}
