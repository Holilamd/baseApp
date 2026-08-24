<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\GlAccount;
use App\Models\Product;
use App\Models\ProductGlMapping;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    $tenant = Tenant::first();
    if (!$tenant) throw new Exception("No tenant found");

    // Seed GL Accounts if not exists
    $kas = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '1110'], ['name' => 'Kas Teller Utama', 'account_type' => 'ASSET', 'balance' => 0]);
    $rak = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '1999'], ['name' => 'Rekening Antar Kantor (RAK)', 'account_type' => 'ASSET', 'balance' => 0]);
    $tabungan = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '2110'], ['name' => 'Kewajiban Tabungan', 'account_type' => 'LIABILITY', 'balance' => 0]);
    
    // Financing GL Accounts
    $piutang = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '1410'], ['name' => 'Piutang Pembiayaan Murabahah', 'account_type' => 'ASSET', 'balance' => 0]);
    $margin_ditangguhkan = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '1411'], ['name' => 'Margin Murabahah Ditangguhkan', 'account_type' => 'ASSET', 'balance' => 0]);
    $pendapatan = GlAccount::firstOrCreate(['tenant_id' => $tenant->id, 'account_number' => '4110'], ['name' => 'Pendapatan Margin Pembiayaan', 'account_type' => 'REVENUE', 'balance' => 0]);

    // Update Tenant Settings
    $settings = $tenant->settings ?? [];
    $settings['cash_gl_account_id'] = $kas->id;
    $settings['rak_gl_account_id'] = $rak->id;
    $settings['kop_surat_url'] = 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Logo_Koperasi_Indonesia.png';
    $tenant->update(['settings' => $settings]);

    // Update Products
    $products = Product::where('tenant_id', $tenant->id)->get();
    foreach($products as $product) {
        if ($product->category === 'FUNDING' || $product->type === 'FUNDING') {
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'CASH_DEPOSIT'
            ], ['gl_account_id' => $tabungan->id, 'position' => 'CREDIT']);
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'CASH_WITHDRAWAL'
            ], ['gl_account_id' => $tabungan->id, 'position' => 'DEBIT']);
        } else if ($product->category === 'LENDING' || $product->type === 'LENDING') {
            $product->update(['calculation_method' => 'FLAT']);
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'DISBURSEMENT'
            ], ['gl_account_id' => $piutang->id, 'position' => 'DEBIT']);
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'DEFERRED_MARGIN'
            ], ['gl_account_id' => $margin_ditangguhkan->id, 'position' => 'CREDIT']);
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'INSTALLMENT_PRINCIPAL'
            ], ['gl_account_id' => $piutang->id, 'position' => 'CREDIT']);
            ProductGlMapping::updateOrCreate([
                'tenant_id' => $tenant->id, 'product_id' => $product->id, 'transaction_trigger' => 'INSTALLMENT_MARGIN'
            ], ['gl_account_id' => $pendapatan->id, 'position' => 'CREDIT']);
        }
    }

    DB::commit();
    echo "Seed COA Mappings and Tenant Settings successful!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
