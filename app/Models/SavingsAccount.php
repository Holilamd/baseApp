<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingsAccount extends Model
{
    protected $fillable = [
        'tenant_id',
        'branch_id',
        'customer_id',
        'product_id',
        'account_number',
        'balance',
        'status',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
