import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Image,
    Palette,
    LogOut,
    Menu,
    X,
    Clock,
    Tv,
    Moon,
    Globe,
    Wallet,
    Bell,
    Users,
    CalendarHeart,
    ImageIcon,
    BookOpen,
    Settings, // Added Settings icon
    LayoutGrid // Added LayoutGrid icon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

const navGroups = [
    {
        title: 'Menu Utama',
        id: 'main',
        items: [
            { path: '/connect/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/connect/identity', icon: Building2, label: 'Identitas Masjid' },
        ]
    },
    {
        title: 'Layanan Jamaah',
        id: 'services',
        items: [
            { path: '/connect/zis', icon: Wallet, label: 'Laporan ZIS' },
            { path: '/connect/ramadan', icon: Moon, label: 'Kelola Ramadan' },
            { path: '/connect/special-events', icon: CalendarHeart, label: 'Agenda' },
        ]
    },
    {
        title: 'Media & Konten',
        id: 'content',
        items: [
            { path: '/connect/announcements', icon: Bell, label: 'Pengumuman' },
            { path: '/connect/articles', icon: Globe, label: 'Artikel' },
            { path: '/connect/gallery', icon: ImageIcon, label: 'Galeri Foto' },
            { path: '/connect/quotes', icon: BookOpen, label: 'Quote Islami' },
        ]
    },
    {
        title: 'Display & Jadwal',
        id: 'display',
        items: [
            { path: '/connect/display-content', icon: Image, label: 'Display Konten' },
            { path: '/connect/prayer-settings', icon: Settings, label: 'Pengaturan Jadwal' },
            { path: '/connect/layout', icon: LayoutGrid, label: 'Tampilan' },
        ]
    },
    {
        title: 'Pengaturan Sistem',
        id: 'system',
        adminOnly: true,
        items: [
            { path: '/connect/users', icon: Users, label: 'Administrator' },
        ]
    }
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/connect');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex" data-testid="dashboard-layout">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform lg:transform-none flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
                data-testid="sidebar"
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg text-white">Jam Sholat</h2>
                            <p className="text-xs text-slate-400">Panel Admin</p>
                        </div>
                    </div>
                    <button
                        className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <nav className="px-4 py-2">
                        {/* Define active group logic to keep accordion open */}
                        {(() => {
                            const activeGroupId = navGroups.find(g => g.items.some(i => i.path === location.pathname))?.id || 'main';
                            return (
                                <Accordion type="multiple" defaultValue={[activeGroupId]} className="space-y-2">
                                    {navGroups.map((group) => {
                                        if (group.adminOnly && user?.role !== 'admin') return null;

                                        return (
                                            <AccordionItem key={group.id} value={group.id} className="border-none">
                                                <AccordionTrigger className="px-2 py-2 text-xs text-slate-500 uppercase tracking-wider hover:text-white hover:no-underline rounded-lg transition-colors group">
                                                    {group.title}
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-1 pb-2 space-y-1">
                                                    {group.items.map((item) => {
                                                        const isActive = location.pathname === item.path;
                                                        return (
                                                            <Link
                                                                key={item.path}
                                                                to={item.path}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={cn(
                                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
                                                                    isActive
                                                                        ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                                                                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                                                                )}
                                                            >
                                                                <div className={cn("flex items-center justify-center rounded-md p-1", isActive ? "bg-emerald-500/20" : "")}>
                                                                    <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                                                                </div>
                                                                {item.label}
                                                            </Link>
                                                        );
                                                    })}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            );
                        })()}
                    </nav>

                    {/* Preview Links */}
                    <div className="px-4 pb-4 space-y-2">
                        <Link
                            to="/"
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-2 rounded-lg font-body text-sm text-blue-400 bg-blue-900/20 hover:bg-blue-900/30 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            Lihat Homepage
                        </Link>
                        <Link
                            to="/ramadan"
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-2 rounded-lg font-body text-sm text-amber-400 bg-amber-900/20 hover:bg-amber-900/30 transition-colors"
                        >
                            <Moon className="w-4 h-4" />
                            Kanal Ramadan
                        </Link>
                        <Link
                            to="/"
                            target="_blank"
                            className="flex items-center gap-3 px-4 py-2 rounded-lg font-body text-sm text-gold-400 bg-gold-900/20 hover:bg-gold-900/30 transition-colors"
                        >
                            <Tv className="w-4 h-4" />
                            Display TV
                        </Link>
                    </div>
                </div>

                {/* User Info & Logout - Fixed at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <span className="text-sm text-white font-medium">
                                    {user?.name?.[0]?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-white font-body">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500">@{user?.username}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                            data-testid="logout-button"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-slate-400 hover:text-white"
                            data-testid="mobile-menu-button"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="font-heading text-lg text-white">Panel Admin</h1>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
