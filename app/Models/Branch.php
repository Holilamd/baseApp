<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'tenant_id', 'code', 'name', 'address', 
        'operational_status', 'operational_date'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
