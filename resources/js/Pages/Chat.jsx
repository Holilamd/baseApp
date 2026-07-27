import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
    Send, 
    Search, 
    Phone, 
    Video, 
    CheckCheck,
    RefreshCw,
    Users,
    Plus,
    X,
    MessageSquare,
    VideoOff,
    MicOff,
    PhoneOff,
    Mic,
    Video as VideoIcon,
    Paperclip,
    File as FileIcon,
    Download,
    ArrowLeft
} from 'lucide-react';

export default function Chat({ contacts: initialContacts, groups: initialGroups, currentUserId }) {
    const [contacts, setContacts] = useState(initialContacts || []);
    const [groups, setGroups] = useState(initialGroups || []);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Active chat selection
    const [activeChat, setActiveChat] = useState(() => {
        if (contacts.length > 0) return { type: 'user', id: contacts[0].id };
        if (groups.length > 0) return { type: 'group', id: groups[0].id };
        return null;
    });

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Mobile View state: 'list' (shows contacts list) or 'chat' (shows active conversation screen)
    const [mobileView, setMobileView] = useState('list');

    // Group Create Modal state
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // WebRTC Video/Voice Call states
    const [callState, setCallState] = useState({
        isActive: false,
        type: 'video',
        isIncoming: false,
        status: 'idle',
        contactId: null,
        contactName: ''
    });
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // WebRTC Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    // Online presence users
    const [onlineUsers, setOnlineUsers] = useState(() => {
        return (initialContacts || [])
            .filter(c => c.is_online)
            .map(c => c.id);
    });

    const activeContact = activeChat?.type === 'user' ? contacts.find(c => c.id === activeChat.id) : null;
    const activeGroup = activeChat?.type === 'group' ? groups.find(g => g.id === activeChat.id) : null;

    // Scroll to bottom on message updates
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (!activeChat) return;

        setLoadingMessages(true);
        axios.get(`/chat/messages/${activeChat.id}`, {
            params: { type: activeChat.type }
        })
        .then(res => {
            const chatMsgs = res.data.filter(m => !m.message.startsWith('__SIGNAL__:'));
            setMessages(chatMsgs);
            setLoadingMessages(false);
        })
        .catch(err => {
            console.error(err);
            setLoadingMessages(false);
        });
    }, [activeChat]);

    // Fallback polling for new messages & WebRTC signaling
    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeChat) return;

            axios.get(`/chat/messages/${activeChat.id}`, {
                params: { type: activeChat.type }
            })
            .then(res => {
                const signals = res.data.filter(m => m.message.startsWith('__SIGNAL__:') && m.sender_id !== currentUserId);
                if (signals.length > 0) {
                    processIncomingSignals(signals);
                }

                const chatMsgs = res.data.filter(m => !m.message.startsWith('__SIGNAL__:'));
                setMessages(prev => {
                    if (prev.length !== chatMsgs.length) {
                        return chatMsgs;
                    }
                    return prev;
                });
            })
            .catch(err => console.error(err));
        }, 3000);

        return () => clearInterval(interval);
    }, [activeChat, callState]);

    // Setup Echo listening
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.private(`chat.user.${currentUserId}`)
                .listen('.message.sent', (e) => {
                    if (e.message.message.startsWith('__SIGNAL__:')) {
                        processIncomingSignals([e.message]);
                        return;
                    }

                    if (activeChat?.type === 'user' && e.message.sender_id === activeChat.id) {
                        setMessages(prev => prev.some(m => m.id === e.message.id) ? prev : [...prev, e.message]);
                    } else {
                        setContacts(prev => prev.map(c => {
                            if (c.id === e.message.sender_id) {
                                return { ...c, unread: (c.unread || 0) + 1 };
                            }
                            return c;
                        }));
                    }
                });

            window.Echo.join('chat.presence')
                .here((users) => {
                    setOnlineUsers(users.map(u => u.id));
                })
                .joining((user) => {
                    setOnlineUsers(prev => [...prev, user.id]);
                })
                .leaving((user) => {
                    setOnlineUsers(prev => prev.filter(id => id !== user.id));
                });

            groups.forEach(g => {
                window.Echo.private(`chat.group.${g.id}`)
                    .listen('.message.sent', (e) => {
                        if (activeChat?.type === 'group' && e.message.group_id === activeChat.id) {
                            setMessages(prev => prev.some(m => m.id === e.message.id) ? prev : [...prev, e.message]);
                        } else {
                            setGroups(prev => prev.map(item => {
                                if (item.id === e.message.group_id) {
                                    return { ...item, unread: (item.unread || 0) + 1 };
                                }
                                return item;
                            }));
                        }
                    });
            });

            return () => {
                window.Echo.leave(`chat.user.${currentUserId}`);
                window.Echo.leave('chat.presence');
                groups.forEach(g => {
                    window.Echo.leave(`chat.group.${g.id}`);
                });
            };
        }
    }, [activeChat, currentUserId, groups]);

    const sendSignal = (receiverId, signalType, data) => {
        const payload = `__SIGNAL__:${signalType}:${JSON.stringify(data)}`;
        return axios.post('/chat/messages', {
            receiver_id: receiverId,
            message: payload
        });
    };

    const processIncomingSignals = async (signals) => {
        for (const sig of signals) {
            // Ignore signals that are older than 15 seconds to prevent re-triggering calls from database history
            const signalAgeMs = Date.now() - new Date(sig.created_at).getTime();
            if (signalAgeMs > 15000) {
                continue;
            }

            const parts = sig.message.split(':');
            const type = parts[1];
            const data = JSON.parse(parts.slice(2).join(':'));

            if (type === 'invite' && !callState.isActive) {
                const caller = contacts.find(c => c.id === sig.sender_id);
                setCallState({
                    isActive: true,
                    type: data.type,
                    isIncoming: true,
                    status: 'ringing',
                    contactId: sig.sender_id,
                    contactName: caller ? caller.name : 'Unknown User'
                });
            } else if (type === 'accept' && callState.status === 'calling') {
                setCallState(prev => ({ ...prev, status: 'connected' }));
                await initiatePeerConnection(sig.sender_id, false);
            } else if (type === 'reject' || type === 'hangup') {
                endCallSession(false);
            } else if (type === 'offer' && callState.isIncoming && peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                sendSignal(sig.sender_id, 'answer', { sdp: answer });
            } else if (type === 'answer' && peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (type === 'candidate' && peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        }
    };

    const initiatePeerConnection = async (targetId, isCaller) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: callState.type === 'video',
            audio: true
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
            if (remoteVideoRef.current && callState.type === 'video') {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(targetId, 'candidate', { candidate: event.candidate });
            }
        };

        if (isCaller) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(targetId, 'offer', { sdp: offer });
        }
    };

    const startCall = async (type) => {
        if (!activeContact) return;

        setCallState({
            isActive: true,
            type: type,
            isIncoming: false,
            status: 'calling',
            contactId: activeContact.id,
            contactName: activeContact.name
        });

        sendSignal(activeContact.id, 'invite', { type: type });
    };

    const acceptCall = async () => {
        setCallState(prev => ({ ...prev, status: 'connected' }));
        await sendSignal(callState.contactId, 'accept', {});
        await initiatePeerConnection(callState.contactId, true);
    };

    const endCallSession = (sendNotification = true) => {
        if (sendNotification && callState.contactId) {
            sendSignal(callState.contactId, callState.status === 'ringing' ? 'reject' : 'hangup', {});
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        setCallState({
            isActive: false,
            type: 'video',
            isIncoming: false,
            status: 'idle',
            contactId: null,
            contactName: ''
        });
        setIsMuted(false);
        setIsVideoOff(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChat) return;

        const originalText = messageText;
        setMessageText('');

        const tempMsg = {
            id: Date.now(),
            sender_id: currentUserId,
            receiver_id: activeChat.type === 'user' ? activeChat.id : null,
            group_id: activeChat.type === 'group' ? activeChat.id : null,
            message: originalText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        axios.post('/chat/messages', {
            receiver_id: activeChat.type === 'user' ? activeChat.id : null,
            group_id: activeChat.type === 'group' ? activeChat.id : null,
            message: originalText
        })
        .then(res => {
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
        })
        .catch(err => console.error(err));
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items || !activeChat) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (!file) continue;

                const tempId = Date.now();
                const tempMsg = {
                    id: tempId,
                    sender_id: currentUserId,
                    receiver_id: activeChat.type === 'user' ? activeChat.id : null,
                    group_id: activeChat.type === 'group' ? activeChat.id : null,
                    message: 'Uploading image attachment...',
                    created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, tempMsg]);

                const formData = new FormData();
                formData.append('file', file);

                axios.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                .then(res => {
                    return axios.post('/chat/messages', {
                        receiver_id: activeChat.type === 'user' ? activeChat.id : null,
                        group_id: activeChat.type === 'group' ? activeChat.id : null,
                        message: res.data.url
                    });
                })
                .then(msgRes => {
                    setMessages(prev => prev.map(m => m.id === tempId ? msgRes.data.message : m));
                })
                .catch(err => {
                    console.error(err);
                    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, message: 'Image upload failed.' } : m));
                });
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;

        const tempId = Date.now();
        const tempMsg = {
            id: tempId,
            sender_id: currentUserId,
            receiver_id: activeChat.type === 'user' ? activeChat.id : null,
            group_id: activeChat.type === 'group' ? activeChat.id : null,
            message: `Uploading file: ${file.name}...`,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const formData = new FormData();
        formData.append('file', file);

        axios.post('/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
            const filePayload = `__FILE__:${res.data.url}:${res.data.filename}:${res.data.size}`;
            return axios.post('/chat/messages', {
                receiver_id: activeChat.type === 'user' ? activeChat.id : null,
                group_id: activeChat.type === 'group' ? activeChat.id : null,
                message: filePayload
            });
        })
        .then(msgRes => {
            setMessages(prev => prev.map(m => m.id === tempId ? msgRes.data.message : m));
        })
        .catch(err => {
            console.error(err);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, message: `Failed to upload: ${file.name}` } : m));
        });
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!newGroupName.trim() || selectedMembers.length === 0) return;

        axios.post('/chat/groups', {
            name: newGroupName,
            members: selectedMembers
        })
        .then(res => {
            setGroups(prev => [...prev, res.data.group]);
            setActiveChat({ type: 'group', id: res.data.group.id });
            setMobileView('chat');
            setNewGroupName('');
            setSelectedMembers([]);
            setIsGroupModalOpen(false);
        })
        .catch(err => console.error(err));
    };

    const toggleMemberSelection = (userId) => {
        setSelectedMembers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const formatBytes = (bytes) => {
        const size = parseInt(bytes);
        if (isNaN(size)) return 'Unknown size';
        if (size < 1024) return size + ' B';
        if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
        return (size / 1048576).toFixed(1) + ' MB';
    };

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="Boilerplate DB Chat Room">
            <Head title="Chat Room" />

            <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Contacts Sidebar (Responsive: hidden on mobile if chat is open) */}
                <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-950/20 ${
                    mobileView === 'chat' ? 'hidden md:flex' : 'flex'
                }`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800/85 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</h3>
                            <button 
                                onClick={() => setIsGroupModalOpen(true)}
                                className="p-1 rounded-lg bg-brand text-white hover:bg-brand-hover active:scale-95 transition-all flex items-center gap-1 text-[10px] font-bold shadow-sm shadow-brand/10"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Group
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                                placeholder="Search DMs or groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                        {/* Groups */}
                        <div className="p-2">
                            <h4 className="px-2 py-1.5 text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                Groups ({filteredGroups.length})
                            </h4>
                            <div className="space-y-0.5">
                                {filteredGroups.map(g => {
                                    const isActive = activeChat?.type === 'group' && activeChat.id === g.id;
                                    return (
                                        <button
                                            key={g.id}
                                            onClick={() => {
                                                setActiveChat({ type: 'group', id: g.id });
                                                setGroups(prev => prev.map(item => item.id === g.id ? { ...item, unread: 0 } : item));
                                                setMobileView('chat');
                                            }}
                                            className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                                                isActive 
                                                    ? 'bg-brand-glow border-l-4 border-brand text-brand' 
                                                    : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                                            }`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300">
                                                G
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-slate-855 dark:text-slate-150 truncate">{g.name}</h5>
                                                <p className="text-[9px] text-slate-400">{g.members_count || 0} members</p>
                                            </div>
                                            {g.unread > 0 && (
                                                <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-black shrink-0">
                                                    {g.unread}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DMs */}
                        <div className="p-2">
                            <h4 className="px-2 py-1.5 text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Direct Messages ({filteredContacts.length})
                            </h4>
                            <div className="space-y-0.5">
                                {filteredContacts.map(c => {
                                    const isActive = activeChat?.type === 'user' && activeChat.id === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setActiveChat({ type: 'user', id: c.id });
                                                setContacts(prev => prev.map(item => item.id === c.id ? { ...item, unread: 0 } : item));
                                                setMobileView('chat');
                                            }}
                                            className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                                                isActive 
                                                    ? 'bg-brand-glow border-l-4 border-brand text-brand' 
                                                    : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                                                    {c.name.charAt(0)}
                                                </div>
                                                {onlineUsers.includes(c.id) ? (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500"></span>
                                                ) : (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-350 dark:bg-slate-700"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150 truncate">{c.name}</h5>
                                                <p className="text-[9px] text-slate-400 truncate">{c.email}</p>
                                            </div>
                                            {c.unread > 0 && (
                                                <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-black shrink-0">
                                                    {c.unread}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Panel (Responsive: hidden on mobile if list is active) */}
                <div className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/10 ${
                    mobileView === 'list' ? 'hidden md:flex' : 'flex'
                }`}>
                    {activeChat ? (
                        <>
                            <div className="h-14 border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-5 flex items-center justify-between bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Mobile Back Button */}
                                    <button
                                        onClick={() => setMobileView('list')}
                                        className="md:hidden p-1.5 rounded-xl text-slate-450 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 shrink-0"
                                        title="Back to conversations"
                                    >
                                        <ArrowLeft className="w-4.5 h-4.5" />
                                    </button>

                                    <div className="w-9 h-9 rounded-xl bg-slate-250 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300 shrink-0">
                                        {activeContact ? activeContact.name.charAt(0) : 'G'}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                                            {activeContact ? activeContact.name : activeGroup?.name}
                                        </h4>
                                        <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                                            {activeContact ? (
                                                <>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(activeContact.id) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {onlineUsers.includes(activeContact.id) ? 'Online' : 'Offline'}
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="w-3 h-3" />
                                                    Group Chat • {activeGroup?.members_count || 0} members
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {activeContact && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button 
                                            onClick={() => startCall('voice')}
                                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 transition-colors"
                                            title="Audio Call"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => startCall('video')}
                                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 transition-colors"
                                            title="Video Call"
                                        >
                                            <VideoIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center gap-2 text-slate-405 text-xs">
                                        <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                                        Loading message history...
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.sender_id === currentUserId;
                                        const timeString = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        const isFile = m.message.startsWith('__FILE__:');
                                        const isImage = !isFile && (m.message.startsWith('/storage/chat_attachments/') || m.message.match(/\.(jpeg|jpg|gif|png|webp)/i) !== null);

                                        return (
                                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && activeGroup && m.sender && (
                                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mb-0.5 ml-2.5">
                                                        {m.sender.name}
                                                    </span>
                                                )}
                                                <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-1 shadow-sm text-xs ${
                                                    isMe 
                                                        ? 'bg-brand text-white rounded-tr-none' 
                                                        : 'bg-white border border-slate-200 dark:border-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                                }`}>
                                                    {isImage ? (
                                                        <img 
                                                            src={m.message} 
                                                            alt="Pasted screenshot" 
                                                            className="max-w-xs md:max-w-md rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:opacity-95 transition-opacity my-1" 
                                                            onClick={() => window.open(m.message, '_blank')}
                                                        />
                                                    ) : isFile ? (() => {
                                                        const [, fileUrl, fileName, fileSize] = m.message.split(':');
                                                        return (
                                                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 min-w-[180px] max-w-full">
                                                                <div className="p-2 bg-brand/10 text-brand rounded-lg shrink-0">
                                                                    <FileIcon className="w-4.5 h-4.5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-150" title={fileName}>{fileName}</p>
                                                                    <p className="text-[9px] text-slate-400 mt-0.5">{formatBytes(fileSize)}</p>
                                                                </div>
                                                                <a 
                                                                    href={fileUrl} 
                                                                    download={fileName}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        );
                                                    })() : (
                                                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                                                    )}
                                                    <div className={`flex items-center gap-1 justify-end text-[9px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                                        <span>{timeString}</span>
                                                        {isMe && (
                                                            <CheckCheck 
                                                                className={`w-3 h-3 ${m.is_read ? 'text-sky-300' : 'text-white/60'}`} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 dark:border-slate-850 dark:bg-slate-900 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef}></div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileSelect} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors shrink-0"
                                        title="Attach file"
                                    >
                                        <Paperclip className="w-4.5 h-4.5" />
                                    </button>
                                    
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all min-w-0"
                                        placeholder="Type a message or paste a screenshot..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onPaste={handlePaste}
                                    />
                                    <button
                                        type="submit"
                                        className="p-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl active:scale-95 transition-all shadow-md shadow-brand/10 flex items-center justify-center shrink-0"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-405 text-xs">
                            Select a contact or group to start chatting.
                        </div>
                    )}
                </div>

            </div>

            {/* CREATE GROUP MODAL */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto outline-none focus:outline-none">
                    <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGroupModalOpen(false)}></div>
                    <div className="relative w-full max-w-md mx-auto my-6 transition-all transform bg-white border border-slate-100 rounded-2xl shadow-2xl dark:bg-slate-900 dark:border-slate-800">
                        <form onSubmit={handleCreateGroup} className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand" />
                                    Create New Chat Group
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400 mb-1.5">Group Name</label>
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                                        placeholder="e.g. Developer Team Chat"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400 mb-2">Select Members</label>
                                    <div className="max-h-42 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 divide-y divide-slate-100 dark:divide-slate-800/40 bg-slate-50/20 dark:bg-slate-950/20">
                                        {contacts.map(c => (
                                            <label 
                                                key={c.id} 
                                                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-850/20 px-2 rounded-lg"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(c.id)}
                                                    onChange={() => toggleMemberSelection(c.id)}
                                                    className="rounded border-slate-300 text-brand focus:ring-brand focus:ring-offset-0 dark:bg-slate-950 dark:border-slate-800"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{c.name}</p>
                                                    <p className="text-[10px] text-slate-405 truncate">{c.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold border rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold text-white bg-brand rounded-xl hover:bg-brand-hover active:scale-95 shadow-sm shadow-brand/10 transition-all"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* WEBRTC CALLING OVERLAY MODAL */}
            {callState.isActive && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[500px]">
                        
                        <div className="absolute top-6 left-6 z-10 text-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center font-bold text-xs">
                                {callState.contactName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold">{callState.contactName}</h4>
                                <p className="text-[9px] text-slate-400 capitalize">
                                    {callState.status === 'connected' ? 'Connected' : `${callState.type} call ringing...`}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
                            {callState.type === 'video' ? (
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
                                    <Phone className="w-10 h-10 text-brand animate-pulse" />
                                    Voice Connection Active
                                </div>
                            )}

                            {callState.type === 'video' && callState.status === 'connected' && (
                                <div className="absolute bottom-6 right-6 w-24 h-32 md:w-32 md:h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-lg">
                                    <video 
                                        ref={localVideoRef} 
                                        autoPlay 
                                        muted 
                                        playsInline 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            )}
                            
                            {callState.status === 'ringing' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-6 p-4">
                                    <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center animate-ping absolute"></div>
                                    <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center font-black text-xl relative">
                                        {callState.contactName.charAt(0)}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold">{callState.contactName}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Incoming {callState.type} call...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                            {callState.isIncoming && callState.status === 'ringing' ? (
                                <>
                                    <button 
                                        onClick={() => endCallSession(true)}
                                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center gap-1.5 text-[11px] font-semibold active:scale-95 transition-all"
                                    >
                                        <PhoneOff className="w-3.5 h-3.5" />
                                        Decline
                                    </button>

                                    <button 
                                        onClick={acceptCall}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 text-[11px] font-semibold active:scale-95 transition-all"
                                    >
                                        <Phone className="w-3.5 h-3.5 animate-bounce" />
                                        Accept Call
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={toggleMute}
                                        className={`p-2.5 md:p-3.5 rounded-xl transition-colors ${isMuted ? 'bg-rose-600/20 text-rose-500 border border-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                    >
                                        {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                                    </button>

                                    {callState.type === 'video' && (
                                        <button 
                                            onClick={toggleVideo}
                                            className={`p-2.5 md:p-3.5 rounded-xl transition-colors ${isVideoOff ? 'bg-rose-600/20 text-rose-500 border border-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                        >
                                            {isVideoOff ? <VideoOff className="w-4.5 h-4.5" /> : <VideoIcon className="w-4.5 h-4.5" />}
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => endCallSession(true)}
                                        className="p-2.5 md:p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all"
                                    >
                                        <PhoneOff className="w-4.5 h-4.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <audio ref={remoteAudioRef} autoPlay className="hidden" />
        </AuthenticatedLayout>
    );
}
