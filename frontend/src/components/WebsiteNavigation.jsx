import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';

// Navigation Links
const NAV_LINKS = [
    { path: '/homepage', label: 'Home', key: 'home' },
    { path: '/homepage/agenda', label: 'Agenda', key: 'agenda' },
    { path: '/ramadan', label: 'Ramadan', key: 'ramadan' },
    { path: '/homepage/informasi', label: 'Informasi', key: 'informasi' },
    { path: '/homepage/about', label: 'Tentang Kami', key: 'about' },
];

// Responsive Navigation component
export const WebsiteNavigation = ({ activePage = 'home', mosqueIdentity }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="main-navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Name */}
                    <Link to="/homepage" className="flex items-center gap-3" data-testid="navbar-logo">
                        {mosqueIdentity?.logo_url ? (
                            <img 
                                src={mosqueIdentity.logo_url} 
                                alt="Logo Masjid" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-700"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-700">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                        )}
                        <div>
                            <span className="font-bold text-gray-800">{mosqueIdentity?.name || 'Muktamirin'}</span>
                            <p className="text-xs text-emerald-600">Sorogaten</p>
                        </div>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                data-testid={`nav-link-${item.key}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activePage === item.key
                                        ? 'bg-emerald-900 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <button 
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                data-testid="mobile-menu-button"
                            >
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 bg-white">
                            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                            <div className="flex flex-col h-full">
                                {/* Mobile Header */}
                                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                                    {mosqueIdentity?.logo_url ? (
                                        <img 
                                            src={mosqueIdentity.logo_url} 
                                            alt="Logo Masjid" 
                                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-700"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-700">
                                            <span className="text-white font-bold text-xl">M</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-bold text-gray-800">{mosqueIdentity?.name || 'Muktamirin'}</span>
                                        <p className="text-xs text-emerald-600">Sorogaten</p>
                                    </div>
                                </div>
                                
                                {/* Mobile Navigation Links */}
                                <nav className="flex-1 py-6 space-y-1">
                                    {NAV_LINKS.map((item) => (
                                        <Link
                                            key={item.key}
                                            to={item.path}
                                            onClick={() => setMobileOpen(false)}
                                            data-testid={`mobile-nav-${item.key}`}
                                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                                activePage === item.key
                                                    ? 'bg-emerald-900 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                                
                                {/* Mobile Footer */}
                                <div className="pt-6 border-t border-gray-100 text-center">
                                    <p className="text-xs text-gray-400">Masjid Muktamirin Sorogaten</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

// Footer component
export const WebsiteFooter = ({ mosqueIdentity }) => (
    <footer className="bg-emerald-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Masjid */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        {mosqueIdentity?.logo_url ? (
                            <img 
                                src={mosqueIdentity.logo_url} 
                                alt="Logo Masjid" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-700"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center border-2 border-emerald-700">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                        )}
                        <h3 className="font-heading text-xl font-bold">{mosqueIdentity?.name || 'Masjid Muktamirin'}</h3>
                    </div>
                    <p className="text-emerald-200 text-sm mb-4">Sorogaten, Galur, Kulon Progo</p>
                    <div className="space-y-2 text-sm text-emerald-300">
                        <p className="flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {mosqueIdentity?.address || 'Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661'}
                        </p>
                        <p className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            0812-1554-551
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-xs">@</span>
                            @masjid_muktamirin_sorogaten
                        </p>
                    </div>
                </div>
                
                {/* Navigasi */}
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Navigasi</h3>
                    <ul className="space-y-2 text-sm text-emerald-200">
                        <li><Link to="/homepage" className="hover:text-white transition-colors">Jadwal Sholat</Link></li>
                        <li><Link to="/homepage/agenda" className="hover:text-white transition-colors">Kalender Kegiatan</Link></li>
                        <li><Link to="/ramadan" className="hover:text-white transition-colors">Ramadan</Link></li>
                        <li><Link to="/homepage/informasi" className="hover:text-white transition-colors">Informasi ZIS</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                    </ul>
                </div>
                
                {/* Infaq & Donasi */}
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Infaq & Donasi</h3>
                    <p className="text-emerald-200 text-sm mb-4">
                        Salurkan infaq dan sedekah Anda untuk kemakmuran masjid dan kegiatan dakwah.
                    </p>
                    <div className="bg-emerald-900/50 rounded-lg p-4 border border-emerald-800">
                        <p className="font-medium text-sm">BSI (Bank Syariah Indonesia)</p>
                        <p className="text-lg font-mono text-emerald-300 my-1">7148254552</p>
                        <p className="text-xs text-emerald-400">a.n. Masjid Muktamirin</p>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Masjid Muktamirin Sorogaten. Hak cipta dilindungi.</p>
            </div>
        </div>
    </footer>
);

export default WebsiteNavigation;
