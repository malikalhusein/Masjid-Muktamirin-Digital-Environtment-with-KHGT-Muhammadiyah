import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Sun, Users, Book, Calendar, Clock, Star, Heart, Utensils, MapPin, Menu, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { prayerAPI, mosqueAPI, specialEventAPI, qrisAPI, galleryAPI } from '../../lib/api';
import { formatDateIndonesian } from '../../lib/utils';
import { getKHGTHijriDate } from '../../lib/khgtCalendar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Navigation component
const Navigation = ({ activePage = 'ramadan' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Home', key: 'home' },
        { path: '/agenda', label: 'Agenda', key: 'agenda' },
        { path: '/ramadan', label: 'Ramadan', key: 'ramadan' },
        { path: '/informasi', label: 'ZIS', key: 'informasi' },
        { path: '/about', label: 'Tentang Kami', key: 'about' },
    ];

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-700">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-800">Muktamirin</span>
                            <p className="text-xs text-emerald-600">Sorogaten</p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activePage === item.key
                                    ? 'bg-emerald-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {navLinks.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${activePage === item.key
                                    ? 'bg-emerald-900 text-white'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

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
    const [agendas, setAgendas] = useState([]);
    const [qrisSettings, setQrisSettings] = useState(null);
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [ramadanRes, agendaRes, qrisRes, galleryRes] = await Promise.all([
                fetch(`${API_URL}/api/ramadan/today`),
                specialEventAPI.getAll(),
                qrisAPI.getSettings(),
                galleryAPI.getAll(true, 'ramadan')
            ]);

            if (ramadanRes.ok) {
                const ramadanJson = await ramadanRes.json();
                setRamadanData(ramadanJson);
            }
            if (agendaRes.data) {
                setAgendas(agendaRes.data);
            }
            if (qrisRes.data) {
                setQrisSettings(qrisRes.data);
            }
            if (galleryRes.data) {
                setGalleryPhotos(galleryRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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
                        {agendas.length > 0 ? (
                            agendas.map((event, idx) => (
                                <EventCard key={idx} title={event.title} date={event.event_date} description={event.location ? `Lokasi: ${event.location}` : 'Di Masjid Muktamirin'} />
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-2">Belum ada agenda khusus bulan ini.</p>
                        )}
                    </div>
                </div>

                {/* Galeri Foto Ramadan */}
                {galleryPhotos.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <ImageIcon className="w-6 h-6 text-emerald-600" />
                            Galeri Foto Ramadan
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryPhotos.map((photo, idx) => (
                                <motion.div
                                    key={photo.id || idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="group relative rounded-xl overflow-hidden shadow-md bg-white cursor-pointer"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img
                                        src={photo.image_url}
                                        alt={photo.title}
                                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-white text-sm font-medium">{photo.title}</p>
                                            {photo.event_date && (
                                                <p className="text-emerald-300 text-xs mt-1">{new Date(photo.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

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
                                <p className="font-bold text-emerald-700">{qrisSettings?.bank_name || 'BSI (Bank Syariah Indonesia)'}</p>
                                <p className="text-2xl font-mono my-2">{qrisSettings?.account_number || '-'}</p>
                                <p className="text-sm text-gray-500">a.n. {qrisSettings?.account_name || 'Masjid Muktamirin'}</p>
                                {qrisSettings?.qris_image_url && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-400 mb-2">Scan QRIS:</p>
                                        <img src={qrisSettings.qris_image_url} alt="QRIS" className="max-w-[150px] mx-auto rounded-lg" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation arrows */}
                    {galleryPhotos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIdx = galleryPhotos.findIndex(p => p.id === selectedPhoto.id);
                                    const prevIdx = (currentIdx - 1 + galleryPhotos.length) % galleryPhotos.length;
                                    setSelectedPhoto(galleryPhotos[prevIdx]);
                                }}
                                className="absolute left-4 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIdx = galleryPhotos.findIndex(p => p.id === selectedPhoto.id);
                                    const nextIdx = (currentIdx + 1) % galleryPhotos.length;
                                    setSelectedPhoto(galleryPhotos[nextIdx]);
                                }}
                                className="absolute right-4 z-10 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Photo + Caption */}
                    <motion.div
                        key={selectedPhoto.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-4xl w-full flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedPhoto.image_url}
                            alt={selectedPhoto.title}
                            className="max-h-[70vh] w-auto rounded-xl shadow-2xl object-contain"
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-white text-lg font-bold">{selectedPhoto.title}</h3>
                            {selectedPhoto.description && (
                                <p className="text-gray-300 text-sm mt-1">{selectedPhoto.description}</p>
                            )}
                            {selectedPhoto.event_date && (
                                <p className="text-emerald-400 text-xs mt-2">
                                    {new Date(selectedPhoto.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
