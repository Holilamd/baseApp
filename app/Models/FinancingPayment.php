<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancingPayment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'payment_date' => 'datetime',
        'amount_paid' => 'decimal:2',
        'principal_paid' => 'decimal:2',
        'margin_paid' => 'decimal:2',
        'penalty_paid' => 'decimal:2',
    ];

    public function financing()
    {
        return $this->belongsTo(Financing::class);
    }

    public function journalHeader()
    {
        return $this->belongsTo(JournalHeader::class);
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
