<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlAccount extends Model
{
    protected $fillable = ['tenant_id', 'parent_id', 'account_number', 'name', 'normal_balance'];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function parent()
    {
        return $this->belongsTo(GlAccount::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(GlAccount::class, 'parent_id');
    }
}
