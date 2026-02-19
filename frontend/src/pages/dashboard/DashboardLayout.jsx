import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    Image, 
    CalendarDays, 
    Settings, 
    Palette,
    Type,
    LogOut,
    Menu,
    X,
    Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const navItems = [
    { path: '/connect/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/connect/identity', icon: Building2, label: 'Identitas Masjid' },
    { path: '/connect/content', icon: Image, label: 'Konten' },
    { path: '/connect/agenda', icon: CalendarDays, label: 'Agenda' },
    { path: '/connect/running-text', icon: Type, label: 'Running Text' },
    { path: '/connect/layout', icon: Palette, label: 'Tampilan' },
    { path: '/connect/calibration', icon: Clock, label: 'Kalibrasi' },
    { path: '/connect/settings', icon: Settings, label: 'Pengaturan' },
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
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform lg:transform-none",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
                data-testid="sidebar"
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-800">
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
                
                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-colors",
                                    isActive 
                                        ? "bg-emerald-900/50 text-emerald-400 border-l-2 border-emerald-500" 
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                
                {/* Preview Link */}
                <div className="px-4 mt-4">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm text-gold-400 bg-gold-900/20 hover:bg-gold-900/30 transition-colors"
                    >
                        <Clock className="w-5 h-5" />
                        Lihat Display TV
                    </Link>
                </div>
                
                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
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
