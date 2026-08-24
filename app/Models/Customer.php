<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'tenant_id', 'branch_id', 'cif_number', 'full_name', 
        'identity_type', 'identity_number', 'address', 
        'phone_number', 'mother_maiden_name', 'status',
        'principal_saving', 'mandatory_saving', 'custom_fields'
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'principal_saving' => 'decimal:2',
        'mandatory_saving' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function savingsAccounts()
    {
        return $this->hasMany(SavingsAccount::class);
    }
}
