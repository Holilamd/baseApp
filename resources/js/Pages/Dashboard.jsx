import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Shield, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    MessageSquare, 
    Activity, 
    Clock, 
    Plus, 
    Compass,
    Calendar,
    ChevronRight,
    Users2,
    CheckCircle
} from 'lucide-react';

export default function Dashboard() {
    // Tooltip state for interactive line chart
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Mock data for Line Chart
    const lineChartData = [
        { label: 'Mon', value: 340, x: 50, y: 150 },
        { label: 'Tue', value: 580, x: 150, y: 90 },
        { label: 'Wed', value: 490, x: 250, y: 110 },
        { label: 'Thu', value: 820, x: 350, y: 40 },
        { label: 'Fri', value: 710, x: 450, y: 65 },
        { label: 'Sat', value: 950, x: 550, y: 15 },
        { label: 'Sun', value: 1100, x: 650, y: 5 },
    ];

    // Mock data for Bar Chart
    const barChartData = [
        { month: 'Jan', value: 65 },
        { month: 'Feb', value: 85 },
        { month: 'Mar', value: 120 },
        { month: 'Apr', value: 95 },
        { month: 'May', value: 145 },
        { month: 'Jun', value: 180 },
    ];

    const stats = [
        {
            title: 'Active Users',
            value: '1,248',
            change: '+12.5%',
            isPositive: true,
            icon: Users,
            color: 'brand',
            bgGlow: 'from-brand-glow to-brand/5',
            iconColor: 'text-brand bg-brand-glow'
        },
        {
            title: 'Assigned Roles',
            value: '4 Roles',
            change: 'Stable',
            isPositive: true,
            icon: Shield,
            color: 'violet',
            bgGlow: 'from-violet-500/10 to-purple-500/5',
            iconColor: 'text-violet-500 bg-violet-500/10'
        },
        {
            title: 'Live Chat Channels',
            value: '3 Channels',
            change: '+2 new',
            isPositive: true,
            icon: MessageSquare,
            color: 'emerald',
            bgGlow: 'from-emerald-500/10 to-teal-500/5',
            iconColor: 'text-emerald-500 bg-emerald-500/10'
        },
        {
            title: 'Platform Uptime',
            value: '99.98%',
            change: '+0.02%',
            isPositive: true,
            icon: Activity,
            color: 'amber',
            bgGlow: 'from-amber-500/10 to-yellow-500/5',
            iconColor: 'text-amber-500 bg-amber-500/10'
        }
    ];

    const recentLogs = [
        { id: 1, action: 'User "John Doe" registered', time: '5 minutes ago', status: 'success' },
        { id: 2, action: 'Updated System Permissions', time: '1 hour ago', status: 'info' },
        { id: 3, action: 'Database backup completed', time: '3 hours ago', status: 'success' },
        { id: 4, action: 'Role "Editor" created', time: 'Yesterday', status: 'info' }
    ];

    return (
        <AuthenticatedLayout
            header="Overview & Insights"
        >
            <Head title="Dashboard" />

            <div className="space-y-8 font-sans">
                {/* Welcome Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-glow rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 text-center md:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-glow border border-brand/20 text-brand text-xs font-semibold">
                            🚀 Boilerplate Ready
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Welcome to your new Control Panel
                        </h2>
                        <p className="text-slate-400 text-sm max-w-lg">
                            Monitor traffic, manage secure multi-tenant roles, customize menus dynamically, and communicate directly through the new integrated Chat.
                        </p>
                    </div>
                    <div className="relative z-10 flex gap-3 shrink-0">
                        <Link
                            href="/chat"
                            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover active:scale-[0.98] transition-all shadow-lg shadow-brand/10"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Open Chat Room
                        </Link>
                    </div>
                </div>

                {/* Grid of Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((stat, i) => (
                        <div 
                            key={i} 
                            className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 group`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                                        {stat.title}
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${stat.iconColor}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                                    stat.isPositive 
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-400">vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart Card (Traffic Analytics) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    Weekly Platform Visits
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Hover the chart points to interact and view detailed metrics.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +24% Growth
                            </div>
                        </div>

                        {/* Interactive SVG Chart */}
                        <div className="relative pt-4 h-64">
                            <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                                {/* Defs for gradients */}
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--brand-color)" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="var(--brand-color)" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid Lines */}
                                <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" className="dark:stroke-slate-800/40" strokeDasharray="5,5" />
                                <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" className="dark:stroke-slate-800/40" strokeDasharray="5,5" />
                                <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" className="dark:stroke-slate-800/40" strokeDasharray="5,5" />

                                {/* Filled Path Area */}
                                <path
                                    d="M 50 150 L 150 90 L 250 110 L 350 40 L 450 65 L 550 15 L 650 5 L 650 180 L 50 180 Z"
                                    fill="url(#areaGradient)"
                                />

                                {/* Smooth Line Path */}
                                <path
                                    d="M 50 150 L 150 90 L 250 110 L 350 40 L 450 65 L 550 15 L 650 5"
                                    fill="none"
                                    stroke="var(--brand-color)"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />

                                {/* Chart Nodes/Points */}
                                {lineChartData.map((pt, idx) => (
                                    <circle
                                        key={idx}
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={hoveredPoint && hoveredPoint.idx === idx ? "7" : "5"}
                                        className="fill-white dark:fill-slate-900 stroke-brand stroke-[3px] cursor-pointer transition-all duration-150"
                                        onMouseEnter={() => setHoveredPoint({ ...pt, idx })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                ))}
                            </svg>

                            {/* Dynamic Tooltip */}
                            {hoveredPoint && (
                                <div 
                                    className="absolute bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-850 pointer-events-none transition-all duration-100 flex flex-col gap-0.5"
                                    style={{ 
                                        left: `${(hoveredPoint.x / 700) * 100}%`, 
                                        top: `${(hoveredPoint.y / 200) * 100 - 30}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    <span className="text-slate-400 uppercase tracking-wider text-[9px]">{hoveredPoint.label}</span>
                                    <span>{hoveredPoint.value} Visitors</span>
                                </div>
                            )}
                        </div>

                        {/* Chart X Axis Labels */}
                        <div className="flex justify-between px-6 text-xs text-slate-400 font-semibold pt-2">
                            {lineChartData.map((pt, idx) => (
                                <span key={idx} className="w-12 text-center">{pt.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart Card (Registrations) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                Monthly Registrations
                            </h4>
                            <p className="text-xs text-slate-400">
                                Guest sign-up performance.
                            </p>
                        </div>

                        {/* Bar Graphic */}
                        <div className="h-44 flex items-end justify-between gap-2.5 pt-4">
                            {barChartData.map((bar, idx) => {
                                const heightPercentage = (bar.value / 180) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-full relative bg-slate-100 dark:bg-slate-800/60 rounded-lg overflow-hidden h-32 flex items-end">
                                            <div 
                                                className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg group-hover:from-violet-500 group-hover:to-indigo-400 transition-all duration-300"
                                                style={{ height: `${heightPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-250 transition-colors font-semibold">
                                            {bar.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Logs and Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Recent Activity Logs
                        </h4>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand"></div>
                                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                            {log.action}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Start Card */}
                    <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Quick Actions</span>
                            <h4 className="text-lg font-black text-white">Need to customize configurations?</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Change dynamic sidebar navigation layouts, set fine-grained permissions per role, or manage multi-tenant domain mapping in just a few clicks.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 mt-6">
                            <Link 
                                href="/users" 
                                className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
                            >
                                <Users2 className="w-3.5 h-3.5" />
                                Manage Users
                            </Link>
                            <Link 
                                href="/menus" 
                                className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
                            >
                                <Compass className="w-3.5 h-3.5" />
                                Edit Navigation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
