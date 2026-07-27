<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        static::creating(function (Model $model) {
            if (empty($model->tenant_id)) {
                $model->tenant_id = session('tenant_id') ?? (auth()->check() ? auth()->user()->tenant_id : 1);
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = session('tenant_id') ?? (auth()->check() ? auth()->user()->tenant_id : 1);
            $builder->where($builder->getQuery()->from . '.tenant_id', $tenantId);
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
