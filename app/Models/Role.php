<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions');
    }

    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'role_has_menus');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_has_roles');
    }
}
