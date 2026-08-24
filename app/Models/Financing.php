<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Financing extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'disbursed_at' => 'datetime',
        'amount' => 'decimal:2',
        'margin_rate' => 'decimal:2',
        'total_margin' => 'decimal:2',
        'total_payment' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function savingsAccount()
    {
        return $this->belongsTo(SavingsAccount::class);
    }

    public function schedules()
    {
        return $this->hasMany(FinancingSchedule::class)->orderBy('installment_number');
    }

    public function payments()
    {
        return $this->hasMany(FinancingPayment::class)->latest();
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
