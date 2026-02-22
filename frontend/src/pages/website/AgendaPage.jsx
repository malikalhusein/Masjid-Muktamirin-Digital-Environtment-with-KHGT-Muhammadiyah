import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Moon, BookOpen, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { prayerAPI, mosqueAPI, agendaAPI } from '../../lib/api';
import { getCurrentAndNextPrayer, PRAYER_NAMES } from '../../lib/utils';
import { isRamadan } from '../../lib/khgtCalendar';

// Navigation component (same as HomePage)
const Navigation = ({ activePage = 'agenda' }) => (
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

// Prayer Schedule Card
const PrayerScheduleCard = ({ prayerTimes, currentTime }) => {
    const { nextPrayer, nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
    const [countdown, setCountdown] = useState(0);
    
    useEffect(() => {
        if (nextPrayerTime) {
            const diff = Math.floor((nextPrayerTime - currentTime) / 1000);
            setCountdown(Math.max(0, diff));
        }
    }, [nextPrayerTime, currentTime]);
    
    const formatCountdownText = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours} jam ${mins} menit lagi`;
    };
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const prayers = [
        { key: 'subuh', name: 'Subuh', ar: 'الفجر', time: prayerTimes?.subuh },
        { key: 'terbit', name: 'Syuruq', ar: 'الشروق', time: prayerTimes?.terbit },
        { key: 'dzuhur', name: 'Dzuhur', ar: 'الظهر', time: prayerTimes?.dzuhur },
        { key: 'ashar', name: 'Ashar', ar: 'العصر', time: prayerTimes?.ashar },
        { key: 'maghrib', name: 'Maghrib', ar: 'المغرب', time: prayerTimes?.maghrib },
        { key: 'isya', name: 'Isya', ar: 'العشاء', time: prayerTimes?.isya },
    ];
    
    return (
        <div className="bg-emerald-900 rounded-2xl overflow-hidden text-white">
            {/* Header */}
            <div className="p-6 border-b border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="font-bold text-lg">Jadwal Sholat Hari Ini</h3>
                        <p className="text-emerald-300 text-sm">
                            {dayNames[currentTime.getDay()]}, {currentTime.getDate()} {monthNames[currentTime.getMonth()]} {currentTime.getFullYear()}
                        </p>
                    </div>
                    <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                
                {/* Current Time */}
                <div className="text-center py-4">
                    <p className="text-5xl font-bold tabular-nums">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-emerald-400 text-sm uppercase tracking-wider mt-1">WAKTU SETEMPAT (WIB)</p>
                </div>
                
                {/* Next Prayer */}
                <div className="bg-emerald-800/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-300 text-sm">Sholat berikutnya</p>
                        <p className="text-xl font-bold">{PRAYER_NAMES[nextPrayer]?.id || 'Subuh'} — {prayerTimes?.[nextPrayer] || '--:--'}</p>
                    </div>
                    <span className="bg-amber-500 text-emerald-900 px-3 py-1 rounded-full text-sm font-medium">
                        {formatCountdownText(countdown)}
                    </span>
                </div>
            </div>
            
            {/* Prayer Times List */}
            <div className="divide-y divide-emerald-800">
                {prayers.map((prayer) => (
                    <div 
                        key={prayer.key}
                        className={`flex items-center justify-between px-6 py-3 ${
                            nextPrayer === prayer.key ? 'bg-emerald-800/30' : ''
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-arabic text-sm w-10">{prayer.ar}</span>
                            <span className="font-medium">{prayer.name}</span>
                        </div>
                        <span className={`font-bold tabular-nums ${nextPrayer === prayer.key ? 'text-amber-400' : ''}`}>
                            {prayer.time || '--:--'}
                        </span>
                    </div>
                ))}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 bg-emerald-950/50 text-center text-emerald-400 text-xs">
                Metode: PP Muhammadiyah • Koordinat: Sorogaten, Galur, Kulon Progo
            </div>
        </div>
    );
};

// Calendar Component
const CalendarComponent = ({ agendas, currentDate, onDateChange }) => {
    const [viewDate, setViewDate] = useState(currentDate);
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    const hasAgenda = (date) => {
        if (!date) return false;
        const dateStr = date.toISOString().split('T')[0];
        return agendas.some(a => a.event_date === dateStr);
    };
    
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };
    
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-bold text-lg text-gray-800">{monthNames[month]} {year}</h3>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <button
                        key={index}
                        disabled={!date}
                        onClick={() => date && onDateChange?.(date)}
                        className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg relative
                            ${!date ? '' : 'hover:bg-emerald-50 cursor-pointer'}
                            ${isToday(date) ? 'bg-emerald-900 text-white hover:bg-emerald-800' : ''}
                        `}
                    >
                        {date?.getDate()}
                        {hasAgenda(date) && !isToday(date) && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-emerald-900 rounded" /> Hari ini
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Ada agenda
                </div>
                <span className="text-gray-400">Klik tanggal untuk filter</span>
            </div>
        </div>
    );
};

// Agenda Card for list
const AgendaListCard = ({ agenda, icon: Icon }) => {
    const eventDate = new Date(agenda.event_date);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    {Icon ? <Icon className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                    <p className="text-sm text-amber-600">
                        {dayNames[eventDate.getDay()]}, {eventDate.getDate()} {monthNames[eventDate.getMonth()]} • {agenda.event_time}
                    </p>
                    {agenda.description && (
                        <p className="text-sm text-gray-500 mt-1">{agenda.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Footer (simplified)
const Footer = () => (
    <footer className="bg-emerald-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-heading text-xl font-bold mb-4">Masjid Muktamirin</h3>
                    <p className="text-emerald-200 text-sm">Sorogaten, Galur, Kulon Progo</p>
                    <div className="space-y-2 text-sm text-emerald-300 mt-4">
                        <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Jl. Sorogaten Dukuh, Sorogaten II, Karangsewu, Kec. Galur, Kab. Kulon Progo, DIY 55661
                        </p>
                    </div>
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Navigasi</h3>
                    <ul className="space-y-2 text-sm text-emerald-200">
                        <li><Link to="/homepage" className="hover:text-white">Jadwal Sholat</Link></li>
                        <li><Link to="/homepage/agenda" className="hover:text-white">Kalender Kegiatan</Link></li>
                        <li><Link to="/ramadan" className="hover:text-white">Ramadan</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white">Informasi</Link></li>
                        <li><Link to="/homepage/about" className="hover:text-white">Kontak</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading text-lg font-bold mb-4">Infaq & Donasi</h3>
                    <p className="text-emerald-200 text-sm mb-4">Salurkan infaq dan sedekah Anda untuk kemakmuran masjid dan kegiatan dakwah.</p>
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

export default function AgendaPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, agendaRes] = await Promise.all([
                prayerAPI.getTimes(),
                agendaAPI.getAll(true, true),
            ]);
            setPrayerTimes(prayerRes.data);
            setAgendas(agendaRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const filteredAgendas = selectedDate 
        ? agendas.filter(a => a.event_date === selectedDate.toISOString().split('T')[0])
        : agendas;
    
    const getIconForAgenda = (title) => {
        const lower = title.toLowerCase();
        if (lower.includes('tarawih')) return Moon;
        if (lower.includes('tadarus') || lower.includes('quran')) return BookOpen;
        if (lower.includes('kultum')) return BookOpen;
        if (lower.includes('buka') || lower.includes('bukber')) return Users;
        if (lower.includes('nuzulul')) return Star;
        return Calendar;
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-stone-100" data-testid="agenda-page-new">
            <Navigation activePage="agenda" />
            
            {/* Header */}
            <div className="bg-emerald-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">MASJID MUKTAMIRIN</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Agenda & Jadwal Sholat</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-emerald-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Sorogaten, Galur, Kulon Progo
                        </p>
                        <div className="text-right text-sm text-emerald-300">
                            <p>Metode: PP Muhammadiyah</p>
                            <p>Subuh 20° · Isya 18°</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left - Prayer Schedule */}
                    <PrayerScheduleCard prayerTimes={prayerTimes} currentTime={currentTime} />
                    
                    {/* Right - Calendar */}
                    <CalendarComponent 
                        agendas={agendas} 
                        currentDate={currentTime}
                        onDateChange={(date) => setSelectedDate(selectedDate?.toDateString() === date.toDateString() ? null : date)}
                    />
                </div>
                
                {/* Agenda List */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {selectedDate ? `Agenda ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Agenda Mendatang'}
                    </h2>
                    
                    {filteredAgendas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAgendas.map((agenda) => (
                                <AgendaListCard 
                                    key={agenda.id} 
                                    agenda={agenda} 
                                    icon={getIconForAgenda(agenda.title)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{selectedDate ? 'Tidak ada agenda pada tanggal ini' : 'Belum ada agenda mendatang'}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
}
