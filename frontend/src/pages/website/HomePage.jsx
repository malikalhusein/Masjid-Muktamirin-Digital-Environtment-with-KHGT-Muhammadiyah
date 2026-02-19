import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Clock, 
    MapPin, 
    Calendar, 
    Phone, 
    Mail, 
    ExternalLink,
    ChevronRight,
    Moon
} from 'lucide-react';
import { prayerAPI, mosqueAPI, agendaAPI } from '../../lib/api';
import { formatCountdown, getCurrentAndNextPrayer, formatDateIndonesian, PRAYER_NAMES } from '../../lib/utils';
import { getKHGTHijriDate, isRamadan } from '../../lib/khgtCalendar';

// Prayer Time Card
const PrayerTimeCard = ({ name, time, isNext, arabicName }) => (
    <div className={`text-center px-4 py-3 rounded-xl transition-all ${isNext ? 'bg-emerald-600 text-white scale-105' : 'bg-white/10 text-white'}`}>
        <p className="text-xs uppercase tracking-wider opacity-80">{name}</p>
        <p className="text-2xl font-bold tabular-nums">{time}</p>
        {arabicName && <p className="text-xs font-arabic opacity-70">{arabicName}</p>}
    </div>
);

// Countdown component
const CountdownTimer = ({ seconds, prayerName }) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return (
        <div className="text-center">
            <p className="text-sm text-emerald-300 mb-2">Waktu sholat berikutnya</p>
            <p className="text-lg font-medium text-white mb-3">{prayerName}</p>
            <div className="flex items-center justify-center gap-2">
                <div className="bg-emerald-700 px-4 py-2 rounded-lg">
                    <span className="text-3xl font-bold text-white tabular-nums">{String(hours).padStart(2, '0')}</span>
                    <p className="text-xs text-emerald-200">Jam</p>
                </div>
                <span className="text-2xl text-white">:</span>
                <div className="bg-emerald-700 px-4 py-2 rounded-lg">
                    <span className="text-3xl font-bold text-white tabular-nums">{String(mins).padStart(2, '0')}</span>
                    <p className="text-xs text-emerald-200">Menit</p>
                </div>
                <span className="text-2xl text-white">:</span>
                <div className="bg-emerald-700 px-4 py-2 rounded-lg">
                    <span className="text-3xl font-bold text-white tabular-nums">{String(secs).padStart(2, '0')}</span>
                    <p className="text-xs text-emerald-200">Detik</p>
                </div>
            </div>
        </div>
    );
};

// Agenda Card
const AgendaCard = ({ agenda }) => {
    const eventDate = new Date(agenda.event_date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('id-ID', { month: 'short' });
    
    return (
        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 rounded-lg p-3 text-center min-w-[60px]">
                <p className="text-2xl font-bold text-emerald-700">{day}</p>
                <p className="text-xs text-emerald-600 uppercase">{month}</p>
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                {agenda.description && <p className="text-sm text-gray-500 line-clamp-1">{agenda.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{agenda.event_time}</span>
                    {agenda.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{agenda.location}</span>}
                </div>
            </div>
        </div>
    );
};

export default function HomePage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [agendas, setAgendas] = useState([]);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
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
            setAgendas(agendaRes.data.slice(0, 3));
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
    
    // Update clock and countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            
            if (prayerTimes) {
                const { nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
                if (nextPrayerTime) {
                    const now = new Date();
                    const diff = Math.floor((nextPrayerTime - now) / 1000);
                    setCountdownSeconds(Math.max(0, diff));
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [prayerTimes]);
    
    const { nextPrayer } = prayerTimes ? getCurrentAndNextPrayer(prayerTimes) : {};
    const hijriDate = getKHGTHijriDate(currentTime);
    const inRamadan = isRamadan(currentTime);
    
    const prayerList = [
        { key: 'subuh', name: 'Subuh', time: prayerTimes?.subuh, arabic: 'الصبح' },
        { key: 'terbit', name: 'Syuruq', time: prayerTimes?.terbit, arabic: 'الشروق' },
        { key: 'dzuhur', name: 'Dzuhur', time: prayerTimes?.dzuhur, arabic: 'الظهر' },
        { key: 'ashar', name: 'Ashar', time: prayerTimes?.ashar, arabic: 'العصر' },
        { key: 'maghrib', name: 'Maghrib', time: prayerTimes?.maghrib, arabic: 'المغرب' },
        { key: 'isya', name: 'Isya', time: prayerTimes?.isya, arabic: 'العشاء' },
    ];
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-800 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50" data-testid="homepage">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            {mosqueIdentity?.logo_url ? (
                                <img src={mosqueIdentity.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                                    <span className="font-arabic text-white text-lg">م</span>
                                </div>
                            )}
                            <span className="font-bold text-gray-800">{mosqueIdentity?.name || 'Masjid Muktamirin'}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/homepage" className="text-emerald-600 font-medium">Home</Link>
                            <Link to="/homepage/agenda" className="text-gray-600 hover:text-emerald-600">Agenda</Link>
                            {inRamadan && <Link to="/ramadan" className="text-amber-600 hover:text-amber-700 flex items-center gap-1"><Moon className="w-4 h-4" />Ramadan</Link>}
                            <Link to="/homepage/about" className="text-gray-600 hover:text-emerald-600">Tentang Kami</Link>
                            <Link to="/" target="_blank" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4" />TV Display
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Mosque Info */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {mosqueIdentity?.name || 'Masjid Muktamirin'}
                            </h1>
                            <div className="flex items-center gap-2 text-emerald-200 mb-6">
                                <MapPin className="w-5 h-5" />
                                <span>{mosqueIdentity?.address || 'Galur, Kulon Progo'}</span>
                            </div>
                            
                            {/* Date Display */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 inline-block">
                                <p className="text-sm text-emerald-200">{formatDateIndonesian(currentTime)}</p>
                                <p className="text-xl font-arabic">{hijriDate.day} {hijriDate.monthNameAr} {hijriDate.year} هـ</p>
                            </div>
                            
                            {/* Countdown */}
                            <div className="bg-emerald-900/50 backdrop-blur-sm rounded-xl p-6">
                                <CountdownTimer 
                                    seconds={countdownSeconds} 
                                    prayerName={PRAYER_NAMES[nextPrayer]?.id || 'Sholat'} 
                                />
                            </div>
                        </motion.div>
                        
                        {/* Right - Prayer Times */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-center">Jadwal Sholat Hari Ini</h2>
                            <div className="grid grid-cols-3 gap-3">
                                {prayerList.map((prayer) => (
                                    <PrayerTimeCard 
                                        key={prayer.key}
                                        name={prayer.name}
                                        time={prayer.time || '--:--'}
                                        isNext={nextPrayer === prayer.key}
                                        arabicName={prayer.arabic}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Ramadan Banner */}
            {inRamadan && (
                <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="w-6 h-6" />
                                <span className="font-medium">Selamat Menjalankan Ibadah Puasa Ramadan {hijriDate.year} H</span>
                            </div>
                            <Link to="/ramadan" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors">
                                Lihat Kegiatan Ramadan <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
            
            {/* Agenda Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Agenda Terdekat</h2>
                            <p className="text-gray-500">Kegiatan dan pengajian yang akan datang</p>
                        </div>
                        <Link to="/homepage/agenda" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            Lihat Semua <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    {agendas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {agendas.map((agenda) => (
                                <AgendaCard key={agenda.id} agenda={agenda} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada agenda terjadwal</p>
                        </div>
                    )}
                </div>
            </section>
            
            {/* Footer */}
            <footer className="bg-emerald-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4">{mosqueIdentity?.name || 'Masjid Muktamirin'}</h3>
                            <p className="text-emerald-200 text-sm mb-4">{mosqueIdentity?.address || 'Galur, Kulon Progo'}</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="text-xs">FB</span>
                                </a>
                                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="text-xs">IG</span>
                                </a>
                                <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="text-xs">YT</span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Link Cepat</h3>
                            <ul className="space-y-2 text-emerald-200 text-sm">
                                <li><Link to="/homepage/agenda" className="hover:text-white">Agenda</Link></li>
                                <li><Link to="/homepage/about" className="hover:text-white">Tentang Kami</Link></li>
                                <li><Link to="/ramadan" className="hover:text-white">Kanal Ramadan</Link></li>
                                <li><Link to="/" className="hover:text-white">TV Display</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Kontak</h3>
                            <div className="space-y-3 text-emerald-200 text-sm">
                                <p className="flex items-center gap-2"><Phone className="w-4 h-4" />+62 xxx xxxx xxxx</p>
                                <p className="flex items-center gap-2"><Mail className="w-4 h-4" />info@masjidmuktamirin.web.id</p>
                                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />{mosqueIdentity?.address || 'Galur, Kulon Progo'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-300 text-sm">
                        <p>&copy; {new Date().getFullYear()} {mosqueIdentity?.name || 'Masjid Muktamirin'}. Jam Sholat Digital KHGT Muhammadiyah.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
