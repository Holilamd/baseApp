<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\ChatGroup;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    /**
     * Display the chat room interface.
     */
    public function index(): Response
    {
        $authUserId = Auth::id();
        $tenantId = Auth::user()->tenant_id ?? 1;

        // 1. Auto-delete read messages, group messages, or channel messages older than config hours
        $deleteHours = (int) env('CHAT_AUTO_DELETE_HOURS', 12);
        Message::where('created_at', '<', now()->subHours($deleteHours))
            ->where(function ($query) {
                $query->where('is_read', true)
                      ->orWhereNotNull('group_id')
                      ->orWhereNotNull('channel_name');
            })->delete();

        // 2. Auto-delete ALL transient WebRTC call signaling messages older than 5 minutes
        Message::where('message', 'like', '__SIGNAL__:%')
            ->where('created_at', '<', now()->subMinutes(5))
            ->delete();

        // 1. Get all users in the same tenant (except current user) as contacts
        $contacts = User::where('tenant_id', $tenantId)
            ->where('id', '!=', $authUserId)
            ->take(50)
            ->get(['id', 'name', 'email', 'last_seen_at'])
            ->map(function ($c) {
                $c->is_online = $c->last_seen_at && $c->last_seen_at->gt(now()->subMinutes(5));
                return $c;
            });

        // 2. Get all groups this user belongs to
        $groups = ChatGroup::where('tenant_id', $tenantId)
            ->whereHas('members', function ($q) use ($authUserId) {
                $q->where('user_id', $authUserId);
            })
            ->withCount('members')
            ->get();

        return Inertia::render('Chat', [
            'contacts' => $contacts,
            'groups' => $groups,
            'currentUserId' => $authUserId,
        ]);
    }

    /**
     * Fetch message history between logged in user and another user or group.
     */
    public function fetchMessages($id, Request $request): JsonResponse
    {
        $senderId = Auth::id();
        $type = $request->query('type', 'user');

        if ($type === 'group') {
            $messages = Message::where('group_id', $id)
                ->with('sender:id,name') // Load sender information
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            // Mark incoming messages as read
            Message::where('sender_id', $id)
                ->where('receiver_id', $senderId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            $messages = Message::where(function ($query) use ($senderId, $id) {
                $query->where('sender_id', $senderId)
                      ->where('receiver_id', $id);
            })->orWhere(function ($query) use ($senderId, $id) {
                $query->where('sender_id', $id)
                      ->where('receiver_id', $senderId);
            })
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();
        }

        return response()->json($messages);
    }

    /**
     * Send/Store a message and dispatch broadcast event.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'group_id' => 'nullable|exists:chat_groups,id',
            'channel_name' => 'nullable|string',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'] ?? null,
            'group_id' => $validated['group_id'] ?? null,
            'channel_name' => $validated['channel_name'] ?? null,
            'message' => $validated['message'],
        ]);

        // Load sender relation
        $message->load('sender:id,name');

        // Dispatch broadcasting event (safely wrapped in try-catch)
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Exception $e) {
            // Silent fallback if broadcasting is not configured
        }

        return response()->json([
            'status' => 'Message Sent!',
            'message' => $message
        ]);
    }

    /**
     * Create a new chat group and attach members.
     */
    public function createGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'members' => 'required|array|min:1',
            'members.*' => 'exists:users,id',
        ]);

        $authUserId = Auth::id();
        $tenantId = Auth::user()->tenant_id ?? 1;

        // Create the group
        $group = ChatGroup::create([
            'name' => $validated['name'],
            'tenant_id' => $tenantId,
            'created_by' => $authUserId,
        ]);

        // Attach members including creator
        $memberIds = array_unique(array_merge($validated['members'], [$authUserId]));
        $group->members()->attach($memberIds);

        // Load members count
        $group->loadCount('members');

        return response()->json([
            'status' => 'Group Created!',
            'group' => $group
        ]);
    }

    /**
     * Upload an attachment file/image.
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:20480', // Max 20MB
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('chat_attachments', 'public');
            return response()->json([
                'url' => '/storage/' . $path,
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
