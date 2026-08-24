<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalHeader extends Model
{
    protected $fillable = [
        'tenant_id', 'branch_id', 'journal_number', 
        'date', 'description', 'reference'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }
}
