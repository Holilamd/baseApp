<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        if ($this->message->group_id) {
            return [
                new PrivateChannel('chat.group.' . $this->message->group_id),
            ];
        }

        if ($this->message->receiver_id) {
            return [
                new PrivateChannel('chat.user.' . $this->message->receiver_id),
                new PrivateChannel('chat.user.' . $this->message->sender_id),
            ];
        }

        return [
            new PrivateChannel('chat.channel.' . ($this->message->channel_name ?? 'general')),
        ];
    }

    /**
     * Broadcast key naming for frontend listeners.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
