<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    protected $fillable = [
        'tenant_id', 'branch_id', 'approvable_type', 'approvable_id',
        'action', 'old_data', 'new_data', 'status', 'created_by', 'approved_by', 'notes'
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function approvable()
    {
        return $this->morphTo();
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
