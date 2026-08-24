<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];
    public function glMappings()
    {
        return $this->hasMany(ProductGlMapping::class);
    }

    public function documentTemplates()
    {
        return $this->hasMany(DocumentTemplate::class);
    }
}
