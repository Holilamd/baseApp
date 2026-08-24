<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingDailyBalance extends Model
{
    protected $fillable = [
        'tenant_id',
        'savings_account_id',
        'date',
        'balance',
        'total_debit',
        'total_credit',
    ];

    protected $casts = [
        'date' => 'date',
        'balance' => 'decimal:4',
        'total_debit' => 'decimal:4',
        'total_credit' => 'decimal:4',
    ];

    public function savingsAccount()
    {
        return $this->belongsTo(SavingsAccount::class);
    }
}
