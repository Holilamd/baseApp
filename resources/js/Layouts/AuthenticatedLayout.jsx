import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import * as Icons from 'lucide-react';

// Dynamic Lucide Icon Renderer
const MenuIcon = ({ name, className = 'w-5 h-5' }) => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent className={className} />;
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth, tenant } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

    const themesList = [
        { name: 'Classic Blue', class: 'theme-blue', color: 'bg-blue-600' },
        { name: 'Emerald Garden', class: 'theme-emerald', color: 'bg-emerald-600' },
        { name: 'Royal Violet', class: 'theme-violet', color: 'bg-violet-600' },
        { name: 'Sunset Rose', class: 'theme-rose', color: 'bg-rose-600' },
        { name: 'Warm Amber', class: 'theme-amber', color: 'bg-amber-600' },
    ];
    
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const [colorTheme, setColorTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('color-theme') || 'theme-blue';
        }
        return 'theme-blue';
    });

    useEffect(() => {
        const themes = ['theme-emerald', 'theme-violet', 'theme-rose', 'theme-amber'];
        themes.forEach(t => document.documentElement.classList.remove(t));
        
        if (colorTheme !== 'theme-blue') {
            document.documentElement.classList.add(colorTheme);
        }
        localStorage.setItem('color-theme', colorTheme);
    }, [colorTheme]);

    const toggleSubmenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-250">
            {/* Sidebar Overlay for Mobile */}
            {!sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 text-slate-350 transition-all duration-300 flex flex-col ${
                    sidebarOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand / Tenant Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-brand/20">
                            {tenant?.name ? tenant.name.charAt(0) : 'K'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-white truncate text-sm leading-tight">
                                    {tenant?.name || 'KlinikApp'}
                                </span>
                                <span className="text-[10px] text-emerald-450 font-medium tracking-wide uppercase">
                                    {tenant?.domain || 'Single Tenant'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menus */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {auth.menus && auth.menus.map((menu) => {
                        const hasChildren = menu.children && menu.children.length > 0;
                        const isExpanded = expandedMenus[menu.id];
                        const isActive = window.location.pathname === menu.url || 
                            (menu.children && menu.children.some(child => window.location.pathname === child.url));

                        return (
                            <div key={menu.id} className="space-y-1">
                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() => toggleSubmenu(menu.id)}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-800 hover:text-white ${
                                                isActive ? 'text-white bg-slate-800/60' : 'text-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <MenuIcon name={menu.icon} className="w-5 h-5 shrink-0" />
                                                {sidebarOpen && <span>{menu.name}</span>}
                                            </div>
                                            {sidebarOpen && (
                                                <Icons.ChevronRight 
                                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                                                />
                                            )}
                                        </button>
                                        
                                        {sidebarOpen && isExpanded && (
                                            <div className="pl-6 space-y-1 mt-1 transition-all">
                                                {menu.children.map((child) => {
                                                    const isChildActive = window.location.pathname === child.url;
                                                    return (
                                                        <Link
                                                            key={child.id}
                                                            href={child.url}
                                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                                                isChildActive 
                                                                    ? 'bg-brand-glow text-brand font-semibold' 
                                                                    : 'text-slate-450 hover:bg-slate-800/50 hover:text-slate-200'
                                                            }`}
                                                        >
                                                            <span>{child.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={menu.url || '#'}
                                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-brand text-white shadow-md shadow-brand/10' 
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <MenuIcon name={menu.icon} className="w-5 h-5 shrink-0" />
                                        {sidebarOpen && <span>{menu.name}</span>}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
                    {sidebarOpen ? (
                        <p className="text-[11px] text-slate-500">
                            &copy; 2026 Hadiri Systems
                        </p>
                    ) : (
                        <span className="text-[11px] text-slate-650">H</span>
                    )}
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
                    {/* Toggle Button & Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
                        >
                            <Icons.Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Hadiri</span>
                            <Icons.ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[150px]">
                                {header || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    {/* Right Toolbar / User Options */}
                    <div className="flex items-center gap-4">
                        {/* Theme Palette Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Choose Theme"
                            >
                                <Icons.Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>

                            {themeDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setThemeDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl dark:bg-slate-900 py-2 z-20">
                                        <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Select Accent Color</p>
                                        </div>
                                        {themesList.map((t) => (
                                            <button
                                                key={t.class}
                                                onClick={() => {
                                                    setColorTheme(t.class);
                                                    setThemeDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5 ${
                                                    colorTheme === t.class ? 'font-bold bg-slate-50 dark:bg-slate-800/80 text-brand' : ''
                                                }`}
                                            >
                                                <span className={`w-3 h-3 rounded-full ${t.color}`}></span>
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Theme Toggle Switch */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? (
                                <Icons.Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Icons.Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-300 pr-2">
                                    {auth.user.name}
                                </span>
                            </button>

                            {userDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setUserDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl dark:bg-slate-900 dark:border-slate-800 py-1.5 z-20">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('profile.edit')}
                                            className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            method="post"
                                            href={route('logout')}
                                            as="button"
                                            className="w-full text-left block px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
