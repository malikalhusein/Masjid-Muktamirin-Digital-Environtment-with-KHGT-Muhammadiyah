import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Moon, 
    Sun, 
    Calendar, 
    Clock, 
    Users, 
    Utensils,
    Book,
    Star,
    ChevronRight,
    MapPin,
    ExternalLink,
    Home
} from 'lucide-react';
import { prayerAPI, mosqueAPI, agendaAPI } from '../../lib/api';
import { formatDateIndonesian, PRAYER_NAMES } from '../../lib/utils';
import { getKHGTHijriDate, isRamadan } from '../../lib/khgtCalendar';

// Daily Ramadan Card - Shows imam, penceramah, takjil info
const DailyRamadanCard = ({ date, data }) => {
    const hijri = getKHGTHijriDate(date);
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-amber-100 text-sm">{formatDateIndonesian(date)}</p>
                        <p className="text-xl font-bold">{hijri.day} Ramadan {hijri.year} H</p>
                    </div>
                    <Moon className="w-10 h-10 text-amber-200" />
                </div>
            </div>
            
            {/* Content Grid */}
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* Imam Subuh */}
                    <div className="bg-emerald-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-emerald-700 mb-1">
                            <Sun className="w-4 h-4" />
                            <span className="text-xs font-medium">Imam Subuh</span>
                        </div>
                        <p className="font-semibold text-gray-800">{data?.imam_subuh || '-'}</p>
                    </div>
                    
                    {/* Penceramah Subuh */}
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                            <Book className="w-4 h-4" />
                            <span className="text-xs font-medium">Kultum Subuh</span>
                        </div>
                        <p className="font-semibold text-gray-800">{data?.penceramah_subuh || '-'}</p>
                    </div>
                    
                    {/* Penceramah Berbuka */}
                    <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-orange-700 mb-1">
                            <Utensils className="w-4 h-4" />
                            <span className="text-xs font-medium">Ceramah Berbuka</span>
                        </div>
                        <p className="font-semibold text-gray-800">{data?.penceramah_berbuka || '-'}</p>
                    </div>
                    
                    {/* Imam Tarawih */}
                    <div className="bg-purple-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-purple-700 mb-1">
                            <Star className="w-4 h-4" />
                            <span className="text-xs font-medium">Imam Tarawih</span>
                        </div>
                        <p className="font-semibold text-gray-800">{data?.imam_tarawih || '-'}</p>
                    </div>
                </div>
                
                {/* Takjil & Jaburan */}
                <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Penyedia Takjil
                        </span>
                        <span className="font-medium text-gray-800">{data?.penyedia_takjil || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Jaburan Tadarus
                        </span>
                        <span className="font-medium text-gray-800">{data?.penyedia_jaburan || '-'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Event Card for special Ramadan events
const SpecialEventCard = ({ event }) => (
    <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
            <div className="bg-amber-500 text-white rounded-lg p-2">
                <Star className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-amber-700">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                    {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                </div>
            </div>
        </div>
    </div>
);

// Ramadan Schedule Section
const RamadanScheduleSection = ({ prayerTimes }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Jadwal Imsakiyah Hari Ini
        </h3>
        <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-slate-900 rounded-xl text-white">
                <p className="text-xs text-slate-400">Imsak</p>
                <p className="text-xl font-bold">{prayerTimes?.imsak || '--:--'}</p>
            </div>
            <div className="text-center p-3 bg-emerald-600 rounded-xl text-white">
                <p className="text-xs text-emerald-200">Subuh</p>
                <p className="text-xl font-bold">{prayerTimes?.subuh || '--:--'}</p>
            </div>
            <div className="text-center p-3 bg-orange-500 rounded-xl text-white">
                <p className="text-xs text-orange-200">Maghrib</p>
                <p className="text-xl font-bold">{prayerTimes?.maghrib || '--:--'}</p>
            </div>
            <div className="text-center p-3 bg-purple-600 rounded-xl text-white">
                <p className="text-xs text-purple-200">Isya</p>
                <p className="text-xl font-bold">{prayerTimes?.isya || '--:--'}</p>
            </div>
        </div>
    </div>
);

// Activity Section
const ActivitySection = ({ title, items, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon className="w-5 h-5 text-amber-500" />
            {title}
        </h3>
        <ul className="space-y-2">
            {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function RamadanPage() {
    const [currentDate] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [ramadanData, setRamadanData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
            ]);
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            
            // Try to fetch Ramadan data
            try {
                const ramadanRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ramadan/today`);
                if (ramadanRes.ok) {
                    const data = await ramadanRes.json();
                    setRamadanData(data);
                }
            } catch (e) {
                // Ramadan data not available, use placeholder
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { fetchData(); }, [fetchData]);
    
    const hijriDate = getKHGTHijriDate(currentDate);
    const inRamadan = isRamadan(currentDate);
    
    // Special events during Ramadan
    const specialEvents = [
        { title: 'Nuzulul Quran', description: 'Peringatan turunnya Al-Quran dengan pengajian akbar', date: '3 Maret 2026', time: 'Ba\'da Maghrib', speaker: 'Toyib Hidayat' },
        { title: 'Khatmil Quran', description: 'Khataman Al-Quran dan doa bersama', date: '28 Ramadan', time: 'Ba\'da Tarawih' },
        { title: 'Takbiran Idul Fitri', description: 'Malam takbiran menyambut Hari Raya', date: '29 Ramadan', time: '20:00 WIB' },
    ];
    
    // Ramadan activities
    const activities = {
        tarawih: ['Tarawih 20 rakaat + witir 3 rakaat', 'Imam bergantian setiap malam', 'Kultum singkat sebelum witir'],
        tadarus: ['Tadarus Al-Quran ba\'da Tarawih', 'Target khatam 30 juz', 'Jaburan disediakan jamaah'],
        bukber: ['Buka bersama internal (Senin-Sabtu)', 'Buka bersama eksternal (Ahad)', 'Menu takjil bergantian'],
        anak: ['TPA Ramadan setiap sore', 'Pesantren kilat akhir pekan', 'Lomba hafalan surat pendek'],
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" data-testid="ramadan-page">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Moon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-gray-800">Kanal Ramadan</span>
                                <p className="text-xs text-amber-600">{mosqueIdentity?.name || 'Masjid Muktamirin'}</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/homepage" className="text-gray-600 hover:text-amber-600 flex items-center gap-1">
                                <Home className="w-4 h-4" />Home
                            </Link>
                            <Link to="/homepage/agenda" className="text-gray-600 hover:text-amber-600">Agenda</Link>
                            <Link to="/ramadan" className="text-amber-600 font-medium">Ramadan</Link>
                            <Link to="/" target="_blank" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4" />TV Display
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Hero */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 0L0 20l20 20 20-20L20 0zm0 5l15 15-15 15L5 20 20 5z" fill="%23ffffff" fill-opacity="0.4" fill-rule="evenodd"/%3E%3C/svg%3E")' }} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4"
                        >
                            <Moon className="w-5 h-5" />
                            <span>Ramadan {hijriDate.year} H / {currentDate.getFullYear()} M</span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Marhaban Ya Ramadan
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-amber-100 text-lg max-w-2xl mx-auto"
                        >
                            Selamat menjalankan ibadah puasa. Mari ramaikan masjid dengan berbagai kegiatan Ramadan penuh berkah.
                        </motion.p>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Daily Card & Schedule */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Card */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-500" />
                                Kegiatan Hari Ini
                            </h2>
                            <DailyRamadanCard date={currentDate} data={ramadanData} />
                        </div>
                        
                        {/* Prayer Schedule */}
                        <RamadanScheduleSection prayerTimes={prayerTimes} />
                        
                        {/* Special Events */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                Event Khusus Ramadan
                            </h2>
                            <div className="space-y-3">
                                {specialEvents.map((event, idx) => (
                                    <SpecialEventCard key={idx} event={event} />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Activities */}
                    <div className="space-y-6">
                        <ActivitySection title="Tarawih & Witir" items={activities.tarawih} icon={Moon} />
                        <ActivitySection title="Tadarus Al-Quran" items={activities.tadarus} icon={Book} />
                        <ActivitySection title="Buka Bersama" items={activities.bukber} icon={Utensils} />
                        <ActivitySection title="Program Anak TPA" items={activities.anak} icon={Users} />
                        
                        {/* Zakat Info */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Zakat Fitrah & Mal
                            </h3>
                            <p className="text-emerald-100 text-sm mb-4">
                                Tunaikan zakat Anda melalui masjid. Penyaluran tepat sasaran kepada mustahik.
                            </p>
                            <div className="bg-white/20 rounded-lg p-3 text-sm">
                                <p className="font-medium">Zakat Fitrah: Rp 45.000/jiwa</p>
                                <p className="text-emerald-200 text-xs mt-1">atau 2.5 kg beras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <footer className="bg-amber-900 text-white py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Moon className="w-8 h-8 mx-auto mb-3 text-amber-300" />
                    <p className="text-amber-300 text-sm">&copy; {currentDate.getFullYear()} Kanal Ramadan - {mosqueIdentity?.name || 'Masjid Muktamirin'}</p>
                    <p className="text-amber-400 text-xs mt-1">Jam Sholat Digital KHGT Muhammadiyah</p>
                </div>
            </footer>
        </div>
    );
}
