import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, Phone, ChevronRight, Moon, BookOpen, Users, ArrowRight, Heart, QrCode, Quote, Menu, X, Image, ExternalLink, User, Mic, Newspaper } from 'lucide-react';
import { prayerAPI, mosqueAPI, specialEventAPI, zisAPI, quoteAPI, galleryAPI, articleAPI } from '../../lib/api';
import { formatCountdown, getCurrentAndNextPrayer, PRAYER_NAMES } from '../../lib/utils';
import { getKHGTHijriDate, isRamadan } from '../../lib/khgtCalendar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../../components/ui/carousel';

// QRIS Image URL
const QRIS_IMAGE_URL = "https://customer-assets.emergentagent.com/job_bc2fce28-e700-491a-980a-47d0af39ffe4/artifacts/tunkmt2e_QRIS%20Modif%4010x-100%20Large.jpeg";

// Helper: Generate Google Calendar URL
const createGoogleCalendarUrl = (agenda) => {
    const title = encodeURIComponent(agenda.title);
    const location = encodeURIComponent(agenda.location || 'Masjid Muktamirin Sorogaten');
    const details = encodeURIComponent(
        [agenda.description, agenda.speaker ? `Penceramah: ${agenda.speaker}` : '', agenda.imam ? `Imam: ${agenda.imam}` : '']
            .filter(Boolean).join('\n')
    );
    const dateStr = agenda.event_date.replace(/-/g, '');
    let dates;
    if (agenda.event_time) {
        const [hours, minutes] = agenda.event_time.split(':');
        const startDt = `${dateStr}T${hours}${minutes}00`;
        const endHour = String(Math.min(23, parseInt(hours) + 2)).padStart(2, '0');
        const endDt = `${dateStr}T${endHour}${minutes}00`;
        dates = `${startDt}/${endDt}`;
    } else {
        dates = `${dateStr}/${dateStr}`;
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${location}&details=${details}`;
};

// Navigation Links
const NAV_LINKS = [
    { path: '/', label: 'Home', key: 'home' },
    { path: '/agenda', label: 'Agenda', key: 'agenda' },
    { path: '/ramadan', label: 'Ramadan', key: 'ramadan' },
    { path: '/informasi', label: 'ZIS', key: 'informasi' },
    { path: '/about', label: 'Tentang Kami', key: 'about' },
];

// Navigation component with responsive mobile menu
const Navigation = ({ activePage = 'home', mosqueIdentity }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="main-navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Name */}
                    <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo">
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
                            <SheetDescription className="sr-only">Menu navigasi website Masjid Muktamirin</SheetDescription>
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
                                            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${activePage === item.key
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
                        <li><Link to="/jamsholat" className="hover:text-white transition-colors">Jadwal Sholat</Link></li>
                        <li><Link to="/agenda" className="hover:text-white transition-colors">Kalender Kegiatan</Link></li>
                        <li><Link to="/ramadan" className="hover:text-white transition-colors">Ramadan</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">Donasi & Infaq</Link></li>
                        <li><Link to="/informasi" className="hover:text-white transition-colors">ZIS</Link></li>
                        <li><Link to="/about" className="hover:text-white transition-colors">Kontak</Link></li>
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
                            className={`text-center py-3 rounded-lg relative ${nextPrayer === prayer.key
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
const AgendaCard = ({ agenda, icon: Icon, onClick }) => {
    const eventDate = new Date(agenda.event_date + 'T00:00:00');
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return (
        <div
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                {Icon ? <Icon className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                <p className="text-sm text-emerald-600">
                    {dayNames[eventDate.getDay()]}, {eventDate.getDate()} {monthNames[eventDate.getMonth()]} • {agenda.event_time || '-'}
                </p>
                {agenda.location && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {agenda.location}
                    </p>
                )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
        </div>
    );
};

// Gallery Slider Component — with inline lightbox
const GallerySlider = ({ galleries }) => {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    if (!galleries || galleries.length === 0) return null;

    const openLightbox = (idx) => setLightboxIdx(idx);
    const closeLightbox = () => setLightboxIdx(null);
    const navigate = (dir) => setLightboxIdx((prev) => (prev + dir + galleries.length) % galleries.length);

    const lightboxItem = lightboxIdx !== null ? galleries[lightboxIdx] : null;

    return (
        <section className="py-12 bg-white" data-testid="gallery-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Galeri Kegiatan</h2>
                        <p className="text-gray-500 text-sm mt-1">Dokumentasi kegiatan masjid terbaru</p>
                    </div>
                    <Link to="/gallery" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                        Lihat semua <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <Carousel opts={{ align: "start", loop: galleries.length > 3 }} className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {galleries.map((item, idx) => (
                            <CarouselItem key={item.id || idx} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                <div
                                    className="block relative group overflow-hidden rounded-xl aspect-[4/3] bg-gray-100 cursor-pointer"
                                    onClick={() => openLightbox(idx)}
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.title || `Galeri ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Image className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                                        <h3 className="font-semibold text-sm">{item.title || 'Kegiatan Masjid'}</h3>
                                        {item.description && (
                                            <p className="text-xs text-white/80 mt-1 line-clamp-2">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {galleries.length > 3 && (
                        <>
                            <CarouselPrevious className="hidden sm:flex -left-4 bg-white border-gray-200 hover:bg-gray-50" />
                            <CarouselNext className="hidden sm:flex -right-4 bg-white border-gray-200 hover:bg-gray-50" />
                        </>
                    )}
                </Carousel>
            </div>

            {/* Inline Lightbox */}
            {lightboxItem && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={closeLightbox}>
                        <X className="w-6 h-6" />
                    </button>
                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {lightboxIdx + 1} / {galleries.length}
                    </div>
                    {/* Prev */}
                    {galleries.length > 1 && (
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}>
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                    )}
                    {/* Image */}
                    <div className="flex flex-col items-center max-w-4xl w-full px-16" onClick={(e) => e.stopPropagation()}>
                        <img src={lightboxItem.image_url} alt={lightboxItem.title || 'Galeri'}
                            className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl" />
                        <div className="mt-4 text-center text-white">
                            <h3 className="font-bold text-lg">{lightboxItem.title || 'Kegiatan Masjid'}</h3>
                            {lightboxItem.description && (
                                <p className="text-sm text-gray-300 mt-2 max-w-lg mx-auto">{lightboxItem.description}</p>
                            )}
                        </div>
                    </div>
                    {/* Next */}
                    {galleries.length > 1 && (
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(1); }}>
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};

// Weekly Agenda Compact Component
const WeeklyAgendaCompact = ({ agendas, onAgendaClick }) => {
    // Get agenda for this week
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const weeklyAgendas = agendas.filter(a => {
        const eventDate = new Date(a.event_date + 'T00:00:00');
        return eventDate >= today && eventDate <= endOfWeek;
    }).slice(0, 5);

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    if (weeklyAgendas.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="weekly-agenda">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">Agenda Minggu Ini</h2>
                        <p className="text-sm text-gray-500">7 hari ke depan</p>
                    </div>
                </div>
                <Link to="/agenda" className="text-emerald-600 text-sm hover:text-emerald-700">
                    Kalender
                </Link>
            </div>

            <div className="space-y-2">
                {weeklyAgendas.map((agenda, idx) => {
                    const eventDate = new Date(agenda.event_date + 'T00:00:00');
                    return (
                        <div
                            key={agenda.id || idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                            onClick={() => onAgendaClick?.(agenda)}
                        >
                            <div className="w-12 text-center flex-shrink-0">
                                <p className="text-xs text-gray-500 uppercase">{dayNames[eventDate.getDay()]}</p>
                                <p className="text-lg font-bold text-emerald-700">{eventDate.getDate()}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{agenda.title}</p>
                                <p className="text-xs text-gray-500">{agenda.event_time}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function HomePage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [agendas, setAgendas] = useState([]);
    const [allAgendas, setAllAgendas] = useState([]);
    const [zisSummary, setZisSummary] = useState(null);
    const [randomQuote, setRandomQuote] = useState(null);
    const [galleries, setGalleries] = useState([]);
    const [articles, setArticles] = useState([]);
    const [selectedAgenda, setSelectedAgenda] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, agendaRes, zisRes, quoteRes, galleryRes, articleRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                specialEventAPI.getAll(true, true),
                zisAPI.getSummary().catch(() => ({ data: null })),
                quoteAPI.getRandom().catch(() => ({ data: null })),
                galleryAPI.getAll(true).catch(() => ({ data: [] })),
                articleAPI.getAll(true).catch(() => ({ data: [] })),
            ]);
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            setAllAgendas(agendaRes.data);
            setAgendas(agendaRes.data.slice(0, 4));
            setZisSummary(zisRes.data);
            setRandomQuote(quoteRes.data);
            setGalleries(galleryRes.data?.slice(0, 6) || []);
            setArticles(articleRes.data?.slice(0, 3) || []);
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
            <Navigation activePage="home" mosqueIdentity={mosqueIdentity} />

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
                                to="/agenda"
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

                    {/* Ramadan Banner - Full width, top position */}
                    {inRamadan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white mb-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                                <Moon className="w-full h-full" />
                            </div>
                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Moon className="w-7 h-7 text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-xl md:text-2xl">Ramadan 1447 H</h2>
                                        <p className="text-emerald-200 text-sm mt-1">
                                            Program lengkap tarawih, tadarus, kultum, dan kegiatan Ramadan.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/ramadan"
                                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-900 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex-shrink-0"
                                >
                                    Lihat Program <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left Column - Agenda Mendatang (3/5 width) */}
                        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Agenda Mendatang</h2>
                                        <p className="text-sm text-gray-500">Kegiatan 7 hari ke depan</p>
                                    </div>
                                </div>
                                <Link to="/agenda" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                    Lihat kalender <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {allAgendas.length > 0 ? (() => {
                                const today = new Date();
                                const endOfWeek = new Date(today);
                                endOfWeek.setDate(today.getDate() + 7);
                                const upcoming = allAgendas.filter(a => {
                                    const eventDate = new Date(a.event_date + 'T00:00:00');
                                    return eventDate >= new Date(today.toDateString());
                                }).slice(0, 6);
                                const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

                                return upcoming.length > 0 ? (
                                    <div className="space-y-2">
                                        {upcoming.map((agenda, idx) => {
                                            const eventDate = new Date(agenda.event_date + 'T00:00:00');
                                            const isToday = eventDate.toDateString() === today.toDateString();
                                            return (
                                                <div
                                                    key={agenda.id || idx}
                                                    className={`flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${isToday ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200'
                                                        }`}
                                                    onClick={() => setSelectedAgenda(agenda)}
                                                >
                                                    <div className={`w-14 text-center flex-shrink-0 rounded-lg py-2 ${isToday ? 'bg-emerald-600 text-white' : 'bg-white shadow-sm'}`}>
                                                        <p className={`text-[10px] font-medium uppercase ${isToday ? 'text-emerald-200' : 'text-gray-400'}`}>
                                                            {dayNames[eventDate.getDay()]}
                                                        </p>
                                                        <p className={`text-xl font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>
                                                            {eventDate.getDate()}
                                                        </p>
                                                        <p className={`text-[10px] ${isToday ? 'text-emerald-200' : 'text-gray-400'}`}>
                                                            {monthNames[eventDate.getMonth()]}
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                            {agenda.event_time && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {agenda.event_time} WIB
                                                                </span>
                                                            )}
                                                            {agenda.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" /> {agenda.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Belum ada agenda terjadwal</p>
                                    </div>
                                );
                            })() : (
                                <div className="text-center py-8 text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada agenda terjadwal</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column (2/5 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quote Islami */}
                            {randomQuote && (
                                <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-6 text-white">
                                    <Quote className="w-8 h-8 text-emerald-400/50 mb-3" />
                                    {randomQuote.arabic_text && (
                                        <p className="text-right font-arabic text-lg text-emerald-100 mb-3">{randomQuote.arabic_text}</p>
                                    )}
                                    <p className="text-white italic">"{randomQuote.translation}"</p>
                                    <p className="text-emerald-300 text-sm mt-3">— {randomQuote.source}</p>
                                </div>
                            )}

                            {/* ZIS Summary Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800">Perolehan ZIS Bulan Ini</h2>
                                        <p className="text-sm text-gray-500">Zakat, Infaq, dan Shodaqoh</p>
                                    </div>
                                </div>
                                {zisSummary && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-emerald-600">Zakat</p>
                                            <p className="font-bold text-emerald-800">Rp {(zisSummary.zakat?.total || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-blue-600">Infaq</p>
                                            <p className="font-bold text-blue-800">Rp {(zisSummary.infaq?.total || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-amber-600">Shodaqoh</p>
                                            <p className="font-bold text-amber-800">Rp {(zisSummary.shodaqoh?.total || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                )}
                                <Link to="/informasi" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                    Lihat laporan lengkap <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artikel & Berita Section */}
            {articles.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Newspaper className="w-5 h-5 text-emerald-700" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Artikel & Berita</h2>
                                    <p className="text-sm text-gray-500">Informasi terbaru dari Masjid Muktamirin</p>
                                </div>
                            </div>
                            <Link to="/artikel" className="text-emerald-600 text-sm flex items-center gap-1 hover:text-emerald-700">
                                Semua artikel <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, idx) => {
                                const createdAt = new Date(article.created_at);
                                const categoryColors = {
                                    kegiatan: 'bg-emerald-100 text-emerald-700',
                                    pembangunan: 'bg-blue-100 text-blue-700',
                                    kajian: 'bg-purple-100 text-purple-700',
                                    pengumuman: 'bg-amber-100 text-amber-700',
                                };
                                return (
                                    <motion.article
                                        key={article.id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        {/* Article Image */}
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            {article.image_url ? (
                                                <img
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                                    <Newspaper className="w-12 h-12 text-emerald-300" />
                                                </div>
                                            )}
                                            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[article.category] || 'bg-gray-100 text-gray-600'}`}>
                                                {article.category || 'Umum'}
                                            </span>
                                        </div>

                                        {/* Article Content */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                                {article.title}
                                            </h3>
                                            {article.excerpt && (
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                <span>{createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {article.author && <span>oleh {article.author}</span>}
                                            </div>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery Slider Section */}
            <GallerySlider galleries={galleries} />

            <Footer mosqueIdentity={mosqueIdentity} />

            {/* Agenda Detail Modal */}
            {selectedAgenda && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedAgenda(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedAgenda.image_url && (
                            <div className="relative">
                                <img src={selectedAgenda.image_url} alt={selectedAgenda.title} className="w-full h-48 object-cover rounded-t-2xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />
                            </div>
                        )}
                        <button
                            onClick={() => setSelectedAgenda(null)}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-1.5 shadow-md transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-6">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-3">
                                {selectedAgenda.category || 'Kegiatan'}
                            </span>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedAgenda.title}</h2>
                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-amber-600" /></div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Tanggal</p>
                                        <p className="text-gray-800 font-medium">{new Date(selectedAgenda.event_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                {selectedAgenda.event_time && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-blue-600" /></div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Waktu</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.event_time} WIB</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-rose-600" /></div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Lokasi</p>
                                        <p className="text-gray-800 font-medium">{selectedAgenda.location || 'Masjid Muktamirin'}</p>
                                    </div>
                                </div>
                                {selectedAgenda.imam && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-purple-600" /></div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Imam</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.imam}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedAgenda.speaker && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0"><Mic className="w-4 h-4 text-teal-600" /></div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Penceramah</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.speaker}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {selectedAgenda.description && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedAgenda.description}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <a
                                    href={createGoogleCalendarUrl(selectedAgenda)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Tambahkan ke Google Calendar
                                </a>
                                <button onClick={() => setSelectedAgenda(null)} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition-colors">Tutup</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Article Detail Modal */}
            {selectedArticle && (
                <div
                    className="fixed inset-0 z-[150] bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setSelectedArticle(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex justify-end p-4 bg-white/80 backdrop-blur-sm">
                            <button onClick={() => setSelectedArticle(null)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        {selectedArticle.image_url ? (
                            <div className="h-56 overflow-hidden -mt-16">
                                <img src={selectedArticle.image_url} alt={selectedArticle.title}
                                    className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-28 -mt-16 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                <Newspaper className="w-12 h-12 text-emerald-300" />
                            </div>
                        )}
                        <div className="p-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${{ kegiatan: 'bg-emerald-100 text-emerald-700', pembangunan: 'bg-blue-100 text-blue-700', kajian: 'bg-purple-100 text-purple-700', pengumuman: 'bg-amber-100 text-amber-700' }[selectedArticle.category] || 'bg-gray-100 text-gray-600'}`}>
                                {selectedArticle.category || 'Umum'}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-800 mt-3 mb-2 leading-snug">{selectedArticle.title}</h2>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {selectedArticle.author && (
                                    <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" /> {selectedArticle.author}
                                    </span>
                                )}
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {selectedArticle.content || selectedArticle.excerpt || 'Tidak ada konten artikel.'}
                            </div>
                            <button onClick={() => setSelectedArticle(null)}
                                className="mt-6 w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition-colors">
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

