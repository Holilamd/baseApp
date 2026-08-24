<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('users', \App\Http\Controllers\UserController::class);
    Route::resource('menus', \App\Http\Controllers\MenuController::class);
    Route::resource('roles', \App\Http\Controllers\RoleController::class);
    
    // BMT Core Routes
    Route::resource('branches', \App\Http\Controllers\BranchController::class);
    Route::resource('gl-accounts', \App\Http\Controllers\GlAccountController::class);
    Route::resource('products', \App\Http\Controllers\ProductController::class);
    Route::post('products/{product}/gl-mappings', [\App\Http\Controllers\ProductController::class, 'saveGlMappings'])->name('products.gl-mappings');
    Route::resource('customers', \App\Http\Controllers\CustomerController::class);
    Route::resource('savings', \App\Http\Controllers\SavingsAccountController::class);
    Route::resource('saving-transactions', \App\Http\Controllers\SavingTransactionController::class)->only(['index', 'store']);
    
    Route::resource('financings', \App\Http\Controllers\FinancingController::class)->only(['index', 'store']);
    Route::get('financings/{financing}/print', [\App\Http\Controllers\FinancingController::class, 'printAkad'])->name('financings.print');
    
    // Financing Payments
    Route::get('financing-payments', [\App\Http\Controllers\FinancingPaymentController::class, 'index'])->name('financing-payments.index');
    Route::post('financing-payments', [\App\Http\Controllers\FinancingPaymentController::class, 'store'])->name('financing-payments.store');
    Route::post('financing-payments/early-payoff', [\App\Http\Controllers\FinancingPaymentController::class, 'earlyPayoff'])->name('financing-payments.early-payoff');
    Route::get('financing-payments/{payment}/print', [\App\Http\Controllers\FinancingPaymentController::class, 'printReceipt'])->name('financing-payments.print');

    Route::get('/approvals', [App\Http\Controllers\ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('/approvals/{transaction}/approve', [App\Http\Controllers\ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/{transaction}/reject', [App\Http\Controllers\ApprovalController::class, 'reject'])->name('approvals.reject');

    // Async Search APIs
    Route::get('/api/search/customers', [App\Http\Controllers\SearchController::class, 'searchCustomers'])->name('api.search.customers');
    Route::get('/api/search/savings-accounts', [App\Http\Controllers\SearchController::class, 'searchSavingsAccounts'])->name('api.search.savings-accounts');
    Route::get('/api/customers/{customer}/details', [App\Http\Controllers\CustomerController::class, 'details'])->name('api.customers.details');

    Route::resource('journals', \App\Http\Controllers\JournalController::class)->only(['index', 'create', 'store']);
    
    // Tenant Settings
    Route::get('/tenant/settings', [App\Http\Controllers\TenantSettingsController::class, 'edit'])->name('tenant.settings');
    Route::post('/tenant/settings', [App\Http\Controllers\TenantSettingsController::class, 'update'])->name('tenant.settings.update');

    // Branch Operations
    Route::get('/branch-operations', [App\Http\Controllers\BranchOperationController::class, 'index'])->name('branch-operations.index');
    Route::put('/branch-operations/{branch}', [App\Http\Controllers\BranchOperationController::class, 'update'])->name('branch-operations.update');

    // Inquiries
    Route::get('/inquiries/savings', [App\Http\Controllers\InquiryController::class, 'savings'])->name('inquiries.savings');
    Route::get('/api/inquiries/savings/{id}', [App\Http\Controllers\InquiryController::class, 'getSavingsHistory']);
    Route::get('/inquiries/savings/{id}/print', [App\Http\Controllers\InquiryController::class, 'printStatement'])->name('inquiries.savings.print');

    // Simpanan Keanggotaan (Pokok & Wajib)
    Route::get('/member-savings', [App\Http\Controllers\MemberSavingsController::class, 'index'])->name('member-savings.index');
    Route::post('/member-savings/deposit', [App\Http\Controllers\MemberSavingsController::class, 'deposit'])->name('member-savings.deposit');
    Route::get('/api/member-savings/{id}/history', [App\Http\Controllers\MemberSavingsController::class, 'getHistory']);

    // Maker-Checker Approvals
    Route::get('/approvals/maker-checker', [App\Http\Controllers\ApprovalsController::class, 'index'])->name('approvals.maker-checker');
    Route::post('/approvals/maker-checker/{approval}', [App\Http\Controllers\ApprovalsController::class, 'process'])->name('approvals.process');

    Route::get('/chat', [\App\Http\Controllers\ChatController::class, 'index'])->name('chat');
    Route::get('/chat/messages/{receiverId}', [\App\Http\Controllers\ChatController::class, 'fetchMessages'])->name('chat.messages');
    Route::post('/chat/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage'])->name('chat.messages.send');
    Route::post('/chat/upload', [\App\Http\Controllers\ChatController::class, 'uploadFile'])->name('chat.messages.upload');
    Route::post('/chat/groups', [\App\Http\Controllers\ChatController::class, 'createGroup'])->name('chat.groups.create');

    // Reports page
    Route::get('/reports', function () {
        return Inertia::render('Reports');
    })->name('reports');

    // Reusable Export Reports endpoints
    Route::get('/reports/export/pdf', [\App\Http\Controllers\ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/export/excel', [\App\Http\Controllers\ReportController::class, 'exportExcel'])->name('reports.excel');
    Route::get('/reports/export/word', [\App\Http\Controllers\ReportController::class, 'exportWord'])->name('reports.word');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
