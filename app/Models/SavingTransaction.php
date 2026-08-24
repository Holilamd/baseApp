<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingTransaction extends Model
{
    protected $fillable = [
        'tenant_id', 'branch_id', 'savings_account_id', 'journal_header_id', 
        'transaction_type', 'amount', 'balance_after', 'description', 'status'
    ];

    protected $casts = [
        'amount' => 'decimal:4',
        'balance_after' => 'decimal:4',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function savingsAccount()
    {
        return $this->belongsTo(SavingsAccount::class);
    }

    public function journalHeader()
    {
        return $this->belongsTo(JournalHeader::class);
    }
}
