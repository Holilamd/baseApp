<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::where('tenant_id', auth()->user()->tenant_id)->latest()->get();
        return Inertia::render('Branches/Index', [
            'branches' => $branches
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:branches,code',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        Branch::create($validated);

        return redirect()->back()->with('success', 'Cabang berhasil ditambahkan.');
    }

    public function update(Request $request, Branch $branch)
    {
        if ($branch->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:branches,code,' . $branch->id,
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $branch->update($validated);

        return redirect()->back()->with('success', 'Cabang berhasil diperbarui.');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $branch->delete();

        return redirect()->back()->with('success', 'Cabang berhasil dihapus.');
    }
}
