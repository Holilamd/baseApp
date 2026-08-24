<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancingRestructure extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'old_amount' => 'decimal:2',
        'new_amount' => 'decimal:2',
        'old_margin_rate' => 'decimal:2',
        'new_margin_rate' => 'decimal:2',
        'old_total_margin' => 'decimal:2',
        'new_total_margin' => 'decimal:2',
    ];

    public function financing()
    {
        return $this->belongsTo(Financing::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
