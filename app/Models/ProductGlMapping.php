<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductGlMapping extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class, 'gl_account_id');
    }
}
