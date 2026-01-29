'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    User,
    PlaneTakeoff,
    FileText,
    UserCheck,
    MessageSquare,
    Settings,
    LogOut,
    Trophy,
    Bell,
    Map,
    ShoppingBag,
    Download,
    Award,
    Gauge,
    LucideIcon
} from 'lucide-react';

interface MenuItem {
    name: string;
    path: string;
    icon: LucideIcon;
    external?: boolean;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setIsAdmin(data.user?.isAdmin || data.user?.role === 'Admin');
                }
            } catch (error) {
                console.error('Sidebar: Auth check failed', error);
            }
        };
        checkAuth();
    }, []);

    const isActive = (path: string) => pathname?.startsWith(path);

    const menuItems: { category: string; items: MenuItem[] }[] = [
        {                              
            category: 'PILOT ADMINISTRATION',
            items: [
                { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
                { name: 'Profile', path: '/portal/profile', icon: User },
            ],
        },
        {
            category: 'FLIGHT OPERATIONS',
            items: [
                { name: 'Dispatch Center', path: '/portal/dispatch', icon: PlaneTakeoff },
                { name: 'My Reports', path: '/portal/reports', icon: FileText },
                { name: 'Tours & Events', path: '/portal/activities', icon: Map },
                { name: 'Leaderboard', path: '/portal/leaderboard', icon: Trophy },
                { name: 'Downloads', path: '/portal/downloads', icon: Download },
            ],
        },
        {
            category: 'COMMUNITY',
            items: [
                { name: 'Discord', path: 'https://discord.levant-va.com/', icon: MessageSquare, external: true },
                { name: 'Pilot Store', path: '/portal/store', icon: ShoppingBag },
                { name: 'Settings', path: '/portal/settings', icon: Settings },
            ],
        },
        {
            category: 'ADMIN',
            items: [
                { name: 'User Management', path: '/portal/admin/users', icon: User },
                { name: 'PIREP Management', path: '/portal/admin/pireps', icon: FileText },
                { name: 'ACARS Management', path: '/portal/admin/acars', icon: Gauge },
                { name: 'Tour Management', path: '/portal/admin/tours', icon: Map },
                { name: 'Badge Management', path: '/portal/admin/badges', icon: Award },
                { name: 'Store Management', path: '/portal/admin/store', icon: ShoppingBag },
                { name: 'DOTM Management', path: '/portal/admin/dotm', icon: Award },
            ],
        },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed', error);
            window.location.href = '/';
        }
    };

    return (
        <aside className="w-64 bg-dark-900 border-r border-white/5 flex-shrink-0 flex flex-col h-screen fixed top-0 left-0 pt-4 overflow-y-auto">
            <div className="px-6 mb-6">
                <Link href="/portal/dashboard" className="block text-center">
                    <img src="/img/logo.png" alt="Levant" className="h-16 w-auto mx-auto" />
                </Link>
            </div>

            <div className="flex-1 px-4 space-y-8">
                {menuItems.map((category) => {
                    if (category.category === 'ADMIN' && !isAdmin) return null;
                    return (
                        <div key={category.category}>
                            <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-4 px-2">
                                {category.category}
                            </h3>
                            <div className="space-y-1">
                                {category.items.map((item) => (
                                    item.external ? (
                                        <a
                                            key={item.name}
                                            href={item.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-2 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                                        >
                                            <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-accent-gold transition-colors" />
                                            {item.name}
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center px-2 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive(item.path)
                                                ? 'bg-accent-gold/10 text-accent-gold'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon
                                                className={`w-5 h-5 mr-3 transition-colors ${isActive(item.path) ? 'text-accent-gold' : 'text-gray-500 group-hover:text-accent-gold'
                                                    }`}
                                            />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-3 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
