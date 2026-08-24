<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalLine extends Model
{
    protected $fillable = [
        'tenant_id', 'journal_header_id', 'gl_account_id', 
        'debit', 'credit', 'description'
    ];

    protected $casts = [
        'debit' => 'decimal:4',
        'credit' => 'decimal:4',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function header()
    {
        return $this->belongsTo(JournalHeader::class, 'journal_header_id');
    }

    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class, 'gl_account_id');
    }
}
