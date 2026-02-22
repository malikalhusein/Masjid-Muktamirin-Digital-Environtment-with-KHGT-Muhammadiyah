import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Users, Book, Calendar, Clock, Star, Heart, Utensils, MapPin } from 'lucide-react';
import { prayerAPI, mosqueAPI } from '../../lib/api';
import { formatDateIndonesian } from '../../lib/utils';
import { getKHGTHijriDate } from '../../lib/khgtCalendar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Navigation component
const Navigation = ({ activePage = 'ramadan' }) => (
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

// Program Card Component
const ProgramCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-emerald-700" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

// Event Card Component  
const EventCard = ({ title, date, description }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-amber-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-amber-600">{date}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
    </div>
);

// Daily Schedule Card
const DailyScheduleCard = ({ date, data, loading }) => {
    const hijri = getKHGTHijriDate(date);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    const fields = [
        { key: 'imam_subuh', label: 'Imam Subuh', icon: Sun },
        { key: 'penceramah_subuh', label: 'Penceramah Subuh', icon: Book },
        { key: 'penceramah_berbuka', label: 'Penceramah Berbuka', icon: Book },
        { key: 'imam_tarawih', label: 'Imam Tarawih', icon: Moon },
        { key: 'penyedia_takjil', label: 'Penyedia Takjil', icon: Utensils },
        { key: 'penyedia_jaburan', label: 'Jaburan Tadarus', icon: Users },
    ];
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-stone-100 px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Petugas Hari Ini</h3>
                    <p className="text-sm text-amber-600">
                        {dayNames[date.getDay()]}, {date.getDate()} {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][date.getMonth()]} {date.getFullYear()}
                    </p>
                </div>
            </div>
            
            {loading ? (
                <div className="p-8 text-center text-gray-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p>Memuat jadwal...</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {fields.map((field) => (
                        <div key={field.key} className="px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <field.icon className="w-4 h-4 text-emerald-600" />
                                <span className="text-gray-600 text-sm">{field.label}</span>
                            </div>
                            <span className="font-medium text-gray-800">
                                {data?.[field.key] || '-'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Footer
const Footer = () => (
    <footer className="bg-emerald-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Moon className="w-8 h-8 mx-auto mb-3 text-amber-400" />
            <p className="text-emerald-300 text-sm">&copy; {new Date().getFullYear()} Kanal Ramadan - Masjid Muktamirin Sorogaten</p>
            <p className="text-emerald-400 text-xs mt-1">Jam Sholat Digital KHGT Muhammadiyah</p>
        </div>
    </footer>
);

export default function RamadanPage() {
    const [currentDate] = useState(new Date());
    const [ramadanData, setRamadanData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/ramadan/today`);
            if (res.ok) {
                const data = await res.json();
                setRamadanData(data);
            }
        } catch (error) {
            console.error('Error fetching Ramadan data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const hijriDate = getKHGTHijriDate(currentDate);
    
    const programs = [
        { icon: Moon, title: 'Tarawih Berjamaah', description: 'Setiap malam Ramadan, 20 rakaat + witir. Ba\'da Isya.' },
        { icon: Book, title: 'Tadarus Al-Qur\'an', description: 'Ba\'da tarawih, target khatam 30 juz selama Ramadan.' },
        { icon: Book, title: 'Kultum Subuh', description: 'Ceramah singkat setelah sholat Subuh berjamaah.' },
        { icon: Sun, title: 'Syuruq', description: 'Sholat Dhuha berjamaah setelah Subuh.' },
        { icon: Users, title: 'Buka Bersama', description: 'Internal (Senin-Sabtu), Eksternal donatur (Ahad).' },
        { icon: Book, title: 'TPA Anak-anak', description: 'Program hafalan dan muraja\'ah untuk anak-anak.' },
        { icon: Heart, title: 'I\'tikaf', description: '10 hari terakhir Ramadan, termasuk info sahur.' },
        { icon: Calendar, title: 'Santunan Yatim & Dhuafa', description: 'Penyaluran bantuan untuk yatim piatu dan dhuafa.' },
    ];
    
    const specialEvents = [
        { title: 'Nuzulul Qur\'an', date: 'Selasa, 3 Maret 2026', description: 'Peringatan turunnya Al-Qur\'an, pemateri: Toyib Hidayat' },
        { title: 'Khatmil Qur\'an', date: 'Jumat, 27 Maret 2026', description: 'Khataman Al-Qur\'an bersama' },
        { title: 'Takbiran Idul Fitri', date: 'Rabu, 18 Maret 2026', description: 'Malam takbiran menyambut Hari Raya' },
        { title: 'Syawalan', date: 'Kamis, 19 Maret 2026', description: 'Halal bihalal jamaah masjid' },
    ];
    
    return (
        <div className="min-h-screen bg-stone-100" data-testid="ramadan-page-new">
            <Navigation activePage="ramadan" />
            
            {/* Hero */}
            <div className="bg-emerald-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="%23ffffff" fill-opacity="0.4"/%3E%3C/svg%3E")' }} />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Moon className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            Ramadan <span className="text-amber-400">{hijriDate.year} H</span>
                        </h1>
                        <p className="text-emerald-200 text-lg max-w-2xl mx-auto">
                            Rangkaian kegiatan ibadah dan dakwah Masjid Muktamirin Sorogaten selama bulan suci Ramadan.
                        </p>
                    </motion.div>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Daily Schedule */}
                <div className="mb-12">
                    <DailyScheduleCard date={currentDate} data={ramadanData} loading={loading} />
                </div>
                
                {/* Programs */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Program Kegiatan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {programs.map((program, idx) => (
                            <ProgramCard key={idx} {...program} />
                        ))}
                    </div>
                </div>
                
                {/* Special Events */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Khusus</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialEvents.map((event, idx) => (
                            <EventCard key={idx} {...event} />
                        ))}
                    </div>
                </div>
                
                {/* Zakat Info */}
                <div className="mt-12 bg-emerald-900 rounded-2xl p-8 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Zakat Fitrah & Mal</h2>
                            <p className="text-emerald-200 mb-4">
                                Tunaikan zakat Anda melalui masjid. Penyaluran tepat sasaran kepada mustahik di lingkungan Sorogaten.
                            </p>
                            <div className="bg-emerald-800/50 rounded-xl p-4 inline-block">
                                <p className="text-emerald-300 text-sm">Zakat Fitrah</p>
                                <p className="text-2xl font-bold">Rp 45.000<span className="text-sm font-normal text-emerald-300">/jiwa</span></p>
                                <p className="text-emerald-400 text-xs mt-1">atau setara 2.5 kg beras</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="bg-white rounded-xl p-6 text-gray-800 inline-block">
                                <p className="text-sm text-gray-500 mb-2">Transfer ke:</p>
                                <p className="font-bold text-emerald-700">BSI (Bank Syariah Indonesia)</p>
                                <p className="text-2xl font-mono my-2">XXX-XXXX-XXX</p>
                                <p className="text-sm text-gray-500">a.n. Masjid Muktamirin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}
