<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancingSchedule extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'due_date' => 'date',
        'paid_date' => 'datetime',
        'is_paid' => 'boolean',
        'principal_amount' => 'decimal:2',
        'margin_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function financing()
    {
        return $this->belongsTo(Financing::class);
    }
}
