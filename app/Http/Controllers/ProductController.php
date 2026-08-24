<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductGlMapping;
use App\Models\GlAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $tenantId = auth()->user()->tenant_id;
        $products = Product::where('tenant_id', $tenantId)
            ->with('glMappings.glAccount')
            ->latest()
            ->get();
        $gl_accounts = GlAccount::where('tenant_id', $tenantId)->orderBy('account_number')->get();
            
        return Inertia::render('Products/Index', [
            'products' => $products,
            'gl_accounts' => $gl_accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|in:FUNDING,LENDING,SERVICE',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'description' => 'nullable|string',
            'calculation_method' => 'nullable|in:FLAT,EFFECTIVE,ANNUITY',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        Product::create($validated);

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        if ($product->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|in:FUNDING,LENDING,SERVICE',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'description' => 'nullable|string',
            'calculation_method' => 'nullable|in:FLAT,EFFECTIVE,ANNUITY',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        if ($product->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Simpan atau update pemetaan GL untuk suatu produk.
     */
    public function saveGlMappings(Request $request, Product $product)
    {
        if ($product->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'mappings' => 'required|array',
            'mappings.*.transaction_trigger' => 'required|string',
            'mappings.*.gl_account_id' => 'required|exists:gl_accounts,id',
            'mappings.*.position' => 'required|in:DEBIT,CREDIT',
        ]);

        $tenantId = auth()->user()->tenant_id;

        // Delete existing mappings and re-create
        $product->glMappings()->delete();

        foreach ($validated['mappings'] as $mapping) {
            ProductGlMapping::create([
                'tenant_id' => $tenantId,
                'product_id' => $product->id,
                'transaction_trigger' => $mapping['transaction_trigger'],
                'gl_account_id' => $mapping['gl_account_id'],
                'position' => $mapping['position'],
            ]);
        }

        return redirect()->back()->with('success', 'Pemetaan GL berhasil disimpan.');
    }
}
