import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, Phone, ChevronRight, Moon, BookOpen, Users, ArrowRight, Heart, QrCode, Quote } from 'lucide-react';
import { prayerAPI, mosqueAPI, agendaAPI, zisAPI, quoteAPI } from '../../lib/api';
import { formatCountdown, getCurrentAndNextPrayer, PRAYER_NAMES } from '../../lib/utils';
import { getKHGTHijriDate, isRamadan } from '../../lib/khgtCalendar';

// QRIS Image URL
const QRIS_IMAGE_URL = "https://customer-assets.emergentagent.com/job_bc2fce28-e700-491a-980a-47d0af39ffe4/artifacts/tunkmt2e_QRIS%20Modif%4010x-100%20Large.jpeg";

// Navigation component
const Navigation = ({ activePage = 'home' }) => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link to="/homepage" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-700">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-800">Muktamirin</span>
                        <p className="text-xs text-emerald-600">Sorogaten</p>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-1">
                    {[
                        { path: '/homepage', label: 'Home', key: 'home' },
                        { path: '/homepage/agenda', label: 'Agenda', key: 'agenda' },
                        { path: '/ramadan', label: 'Ramadan', key: 'ramadan' },
                        { path: '/homepage/about', label: 'Tentang Kami', key: 'about' },
                    ].map((item) => (
                        <Link
                            key={item.key}
                            to={item.path}
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
            </div>
        </div>
    </nav>
);

// Footer component
const Footer = ({ mosqueIdentity }) => (
    <footer className="bg-emerald-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Masjid */}
                <div>
                    <h3 className="font-heading text-xl font-bold mb-4">Masjid Muktamirin</h3>
                    <p className="text-emerald-200 text-sm mb-4">Sorogaten, Galur, Kulon Progo</p>
                    <div className="space-y-2 text-sm text-emerald-300">
                        <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
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
                        <li><Link to="/homepage/about" className="hover:text-white transition-colors">Donasi & Infaq</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white transition-colors">Informasi</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white transition-colors">Kontak</Link></li>
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
                        <p className="text-lg font-mono text-emerald-300 my-1">XXX-XXXX-XXX</p>
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

// Prayer Times Bar component
const PrayerTimesBar = ({ prayerTimes, currentTime }) => {
    const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);
    const [countdown, setCountdown] = useState(0);
    
    useEffect(() => {
        if (!prayerTimes) return;
        const { nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
        if (nextPrayerTime) {
            const diff = Math.floor((nextPrayerTime - currentTime) / 1000);
            setCountdown(Math.max(0, diff));
        }
    }, [prayerTimes, currentTime]);
    
    const prayers = [
        { key: 'subuh', name: 'SUBUH', time: prayerTimes?.subuh },
        { key: 'terbit', name: 'SYURUQ', time: prayerTimes?.terbit },
        { key: 'dzuhur', name: 'DZUHUR', time: prayerTimes?.dzuhur },
        { key: 'ashar', name: 'ASHAR', time: prayerTimes?.ashar },
        { key: 'maghrib', name: 'MAGHRIB', time: prayerTimes?.maghrib },
        { key: 'isya', name: 'ISYA', time: prayerTimes?.isya },
    ];
    
    const formatCountdownText = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours} jam ${mins} mnt lagi`;
    };
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    return (
        <div className="bg-emerald-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top row - Current time and next prayer */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-emerald-400 text-sm uppercase tracking-wider">JAM SEKARANG</p>
                        <p className="text-4xl font-bold tabular-nums">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p className="text-emerald-300 text-sm">
                            {dayNames[currentTime.getDay()]}, {currentTime.getDate()} {monthNames[currentTime.getMonth()]} {currentTime.getFullYear()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-400 text-sm">Sholat berikutnya</p>
                        <p className="text-2xl font-bold text-amber-400">{PRAYER_NAMES[nextPrayer]?.id || 'Subuh'}</p>
                        <p className="text-emerald-300 text-sm flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {prayerTimes?.[nextPrayer] || '--:--'} - {formatCountdownText(countdown)}
                        </p>
                    </div>
                </div>
                
                {/* Prayer times grid */}
                <div className="grid grid-cols-6 gap-2">
                    {prayers.map((prayer) => (
                        <div 
                            key={prayer.key}
                            className={`text-center py-3 rounded-lg relative ${
                                nextPrayer === prayer.key 
                                    ? 'bg-white text-emerald-900' 
                                    : 'bg-emerald-900/50'
                            }`}
                        >
                            <p className="text-xs uppercase tracking-wider opacity-70">{prayer.name}</p>
                            <p className="text-xl font-bold tabular-nums">{prayer.time || '--:--'}</p>
                            {nextPrayer === prayer.key && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Agenda Card Component
const AgendaCard = ({ agenda, icon: Icon }) => {
    const eventDate = new Date(agenda.event_date);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                {Icon ? <Icon className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                <p className="text-sm text-emerald-600">
                    {dayNames[eventDate.getDay()]}, {eventDate.getDate()} {monthNames[eventDate.getMonth()]} • {agenda.event_time}
                </p>
                {agenda.description && (
                    <p className="text-sm text-gray-500 mt-1">{agenda.description}</p>
                )}
            </div>
        </div>
    );
};

export default function HomePage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, agendaRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                agendaAPI.getAll(true, true),
            ]);
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            setAgendas(agendaRes.data.slice(0, 4));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const inRamadan = isRamadan(currentTime);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-stone-100" data-testid="homepage-new">
            <Navigation activePage="home" />
            
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] bg-emerald-900">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: 'url("https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1920&q=80")',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-transparent" />
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl"
                    >
                        <p className="text-emerald-300 text-sm uppercase tracking-widest mb-4">MASJID MUKTAMIRIN</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                            Memakmurkan Masjid,<br />
                            <span className="text-amber-400">Membangun Umat</span>
                        </h1>
                        <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                            Pusat ibadah dan kegiatan dakwah masyarakat Sorogaten, Galur, Kulon Progo. 
                            Bersama membangun generasi berilmu dan beramal.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link 
                                to="/homepage/agenda"
                                className="inline-flex items-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors"
                            >
                                <Clock className="w-5 h-5" />
                                Jadwal Sholat
                            </Link>
                            {inRamadan && (
                                <Link 
                                    to="/ramadan"
                                    className="inline-flex items-center gap-2 bg-emerald-800 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors border border-emerald-600"
                                >
                                    <Moon className="w-5 h-5" />
                                    Program Ramadan
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
            
            {/* Prayer Times Bar */}
            <PrayerTimesBar prayerTimes={prayerTimes} currentTime={currentTime} />
            
            {/* Content Section */}
            <section className="py-12 bg-stone-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Agenda Terdekat */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Agenda Terdekat</h2>
                                <Link to="/homepage/agenda" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                    Lihat kalender <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            
                            {agendas.length > 0 ? (
                                <div className="space-y-3">
                                    {agendas.map((agenda, idx) => (
                                        <AgendaCard 
                                            key={agenda.id} 
                                            agenda={agenda} 
                                            icon={idx === 0 ? Moon : idx === 1 ? BookOpen : idx === 2 ? BookOpen : Users}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada agenda terjadwal</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Informasi & Berita */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800">Informasi & Berita</h2>
                                        <p className="text-sm text-gray-500">Pengumuman, artikel, update pembangunan</p>
                                    </div>
                                </div>
                                <Link to="/homepage/about" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                    Lihat selengkapnya <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            
                            {/* Infaq & Zakat */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800">Infaq & Zakat</h2>
                                        <p className="text-sm text-gray-500">Salurkan donasi untuk masjid</p>
                                    </div>
                                </div>
                                <Link to="/homepage/about" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                    Lihat selengkapnya <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            
                            {/* Ramadan Banner */}
                            {inRamadan && (
                                <div className="bg-emerald-900 rounded-2xl p-6 text-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="w-6 h-6 text-emerald-300" />
                                        <h2 className="font-bold text-lg">Ramadan 1447 H</h2>
                                    </div>
                                    <p className="text-emerald-200 text-sm mb-4">
                                        Program lengkap tarawih, tadarus, kultum, dan kegiatan Ramadan.
                                    </p>
                                    <Link 
                                        to="/ramadan"
                                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium"
                                    >
                                        Lihat Program <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer mosqueIdentity={mosqueIdentity} />
        </div>
    );
}
