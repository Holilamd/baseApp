import React from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck, MessageSquare, LineChart, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
            <Head title="Welcome Back" />

            {/* Left Section: Aesthetic Brand Showcase */}
            <div className="relative md:flex w-full md:w-1/2 bg-slate-900 overflow-hidden flex-col justify-between p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-slate-800/80">
                {/* Background glowing effects */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
                
                {/* Header branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        Hadiri Boilerplate
                    </span>
                </div>

                {/* Main feature content */}
                <div className="relative z-10 my-auto py-12 md:py-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Next-Gen Admin Dashboard
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                        Power up your workflow with <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">premium tooling.</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-md leading-relaxed mb-8">
                        The ultimate starting point equipped with responsive UI tables, roles, menus, interactive charts, and real-time support systems.
                    </p>

                    {/* Features list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <LineChart className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-medium text-slate-200">Interactive Charts</div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-medium text-slate-200">Smart Chat Room</div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-medium text-slate-200">RBAC Security</div>
                        </div>
                    </div>
                </div>

                {/* Footer brand label */}
                <div className="relative z-10 text-xs text-slate-500">
                    &copy; 2026 Hadiri Systems. All rights reserved.
                </div>
            </div>

            {/* Right Section: Clean, Polished Sign-in Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
                {/* Background decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Welcome Text */}
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">
                            Sign in to platform
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {status && (
                        <div className="p-4 text-sm font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-350 font-medium text-xs" />
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1.5 text-xs text-red-400" />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <InputLabel htmlFor="password" value="Password" className="text-slate-350 font-medium text-xs" />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1.5 text-xs text-red-400" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-850 bg-slate-900 text-blue-600 focus:ring-blue-500/30"
                                />
                                <span className="text-xs text-slate-400 hover:text-slate-300">
                                    Remember my session
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/10"
                        >
                            {processing ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Log in to Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
