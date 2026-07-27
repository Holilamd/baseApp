import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Send, 
    Search, 
    MoreVertical, 
    Phone, 
    Video, 
    Circle,
    User,
    Check,
    CheckCheck,
    MessageSquare,
    CornerDownLeft,
    Bot
} from 'lucide-react';

export default function Chat() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeContactId, setActiveContactId] = useState(1);
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const [contacts, setContacts] = useState([
        {
            id: 1,
            name: 'Dev Team Support',
            avatar: 'D',
            status: 'online',
            role: 'Support Bot',
            lastMessage: 'Let me know if you need help with Laravel setup!',
            time: '10:42 AM',
            unread: 0,
            messages: [
                { id: 1, text: 'Hello! Welcome to the Hadiri Boilerplate chat testing console.', sender: 'them', time: '10:39 AM' },
                { id: 2, text: 'This chat features interactive automated replies to demonstrate functionality.', sender: 'them', time: '10:40 AM' },
                { id: 3, text: 'Try sending a message here!', sender: 'them', time: '10:41 AM' }
            ]
        },
        {
            id: 2,
            name: 'Sarah (Design & Layout)',
            avatar: 'S',
            status: 'away',
            role: 'UI Designer',
            lastMessage: 'The new dashboard layout is absolutely stunning!',
            time: 'Yesterday',
            unread: 1,
            messages: [
                { id: 1, text: 'Hi admin! I finished reviewing the new design suggestions.', sender: 'them', time: 'Yesterday' },
                { id: 2, text: 'The new dashboard layout is absolutely stunning!', sender: 'them', time: 'Yesterday' }
            ]
        },
        {
            id: 3,
            name: 'Alex Rivera',
            avatar: 'A',
            status: 'busy',
            role: 'DevOps Lead',
            lastMessage: 'Seeding completed successfully on all tenants.',
            time: '2 days ago',
            unread: 0,
            messages: [
                { id: 1, text: 'Can we run the fresh seed database migration?', sender: 'me', time: '3 days ago' },
                { id: 2, text: 'Yes, go ahead. I checked the scripts.', sender: 'them', time: '3 days ago' },
                { id: 3, text: 'Seeding completed successfully on all tenants.', sender: 'them', time: '2 days ago' }
            ]
        }
    ]);

    const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

    // Scroll to bottom on message updates
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeContact.messages, isTyping]);

    // Handle message send
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Append user message
        const updatedContacts = contacts.map(c => {
            if (c.id === activeContactId) {
                return {
                    ...c,
                    lastMessage: messageText,
                    time: 'Just now',
                    messages: [...c.messages, newUserMessage]
                };
            }
            return c;
        });
        setContacts(updatedContacts);
        const sentText = messageText;
        setMessageText('');

        // Trigger bot/mock response simulation
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            
            let replyText = "That's interesting! I'm a simulated chat response. In production, you can link this interface to Laravel WebSockets, Echo, or Pusher.";
            
            if (activeContactId === 1) {
                if (sentText.toLowerCase().includes('laravel') || sentText.toLowerCase().includes('db') || sentText.toLowerCase().includes('seed')) {
                    replyText = "To apply the database updates, make sure to run 'php artisan migrate:fresh --seed' on your terminal!";
                } else if (sentText.toLowerCase().includes('hello') || sentText.toLowerCase().includes('hi')) {
                    replyText = "Hello! I'm the Support Bot. What can I help you configure in this boilerplate today?";
                } else {
                    replyText = "Great! Your message has been received. I'm ready to assist with any other boilerplate configurations.";
                }
            } else if (activeContactId === 2) {
                replyText = "Thanks for the feedback! Let's schedule a call tomorrow to refine the theme customization settings.";
            } else if (activeContactId === 3) {
                replyText = "Got it. Let me verify the Docker containers and check if the queues are running smoothly.";
            }

            const newResponse = {
                id: Date.now() + 1,
                text: replyText,
                sender: 'them',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setContacts(prev => prev.map(c => {
                if (c.id === activeContactId) {
                    return {
                        ...c,
                        lastMessage: replyText,
                        time: 'Just now',
                        messages: [...c.messages, newResponse]
                    };
                }
                return c;
            }));
        }, 1500);
    };

    // Filter contacts based on search query
    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="Chat Room Support">
            <Head title="Chat Room" />

            <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Contacts Panel Sidebar */}
                <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                    {/* Sidebar Search Bar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800/85 space-y-3">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Contacts List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                        {filteredContacts.map(c => {
                            const isActive = c.id === activeContactId;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setActiveContactId(c.id);
                                        // clear unread on click
                                        setContacts(prev => prev.map(item => item.id === c.id ? { ...item, unread: 0 } : item));
                                    }}
                                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                                        isActive 
                                            ? 'bg-blue-600/10 dark:bg-blue-600/15 border-l-4 border-blue-600' 
                                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                                    }`}
                                >
                                    {/* Avatar with Status indicator */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-350">
                                            {c.avatar}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                                            c.status === 'online' ? 'bg-emerald-500' :
                                            c.status === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
                                        }`}></span>
                                    </div>

                                    {/* Info text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150 truncate">
                                                {c.name}
                                            </h5>
                                            <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                                {c.time}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-1.5">
                                            <p className="text-[11px] text-slate-450 dark:text-slate-400 truncate flex-1">
                                                {c.lastMessage}
                                            </p>
                                            {c.unread > 0 && (
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                                                    {c.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Chat Panel */}
                <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/10">
                    
                    {/* Header Info */}
                    <div className="h-14 border-b border-slate-200 dark:border-slate-800/80 px-5 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                                {activeContact.avatar}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                    {activeContact.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        activeContact.status === 'online' ? 'bg-emerald-500' :
                                        activeContact.status === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`}></span>
                                    {activeContact.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-650 transition-colors">
                                <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-650 transition-colors">
                                <Video className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        {activeContact.messages.map((m) => {
                            const isMe = m.sender === 'me';
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-1 shadow-sm text-xs ${
                                        isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-200 dark:border-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                    }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                                        <div className={`flex items-center gap-1 justify-end text-[9px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                            <span>{m.time}</span>
                                            {isMe && <CheckCheck className="w-3 h-3 text-white/70" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Simulation Indicator */}
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

                    {/* Chat Text Input Footer */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                placeholder="Type a message or trigger replies with 'laravel'..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
