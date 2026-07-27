<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatGroup extends Model
{
    protected $fillable = [
        'name',
        'tenant_id',
        'created_by',
    ];

    /**
     * Get members of this chat group.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_group_members', 'group_id', 'user_id')->withTimestamps();
    }

    /**
     * Get messages sent inside this chat group.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'group_id');
    }

    /**
     * Get the user who created this group.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
