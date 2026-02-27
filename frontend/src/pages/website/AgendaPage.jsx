import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Moon, BookOpen, Users, Star, ChevronLeft, ChevronRight, X, ExternalLink, User, Mic } from 'lucide-react';
import { prayerAPI, mosqueAPI, specialEventAPI } from '../../lib/api';
import { getCurrentAndNextPrayer, PRAYER_NAMES } from '../../lib/utils';
import { isRamadan } from '../../lib/khgtCalendar';
import { WebsiteNavigation, WebsiteFooter } from '../../components/WebsiteNavigation';
import { motion } from 'framer-motion';

// Helper: Generate Google Calendar URL
const createGoogleCalendarUrl = (agenda) => {
    const title = encodeURIComponent(agenda.title);
    const location = encodeURIComponent(agenda.location || 'Masjid Muktamirin Sorogaten');
    const details = encodeURIComponent(
        [agenda.description, agenda.speaker ? `Penceramah: ${agenda.speaker}` : '', agenda.imam ? `Imam: ${agenda.imam}` : '']
            .filter(Boolean).join('\n')
    );

    // Build date/time string
    const dateStr = agenda.event_date.replace(/-/g, '');
    let dates;
    if (agenda.event_time) {
        const [hours, minutes] = agenda.event_time.split(':');
        const startDt = `${dateStr}T${hours}${minutes}00`;
        // Default 2 hour duration
        const endHour = String(Math.min(23, parseInt(hours) + 2)).padStart(2, '0');
        const endDt = `${dateStr}T${endHour}${minutes}00`;
        dates = `${startDt}/${endDt}`;
    } else {
        dates = `${dateStr}/${dateStr}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${location}&details=${details}`;
};

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
                        className={`flex items-center justify-between px-6 py-3 ${nextPrayer === prayer.key ? 'bg-emerald-800/30' : ''
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

    const toLocalDateStr = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const hasAgenda = (date) => {
        if (!date) return false;
        const dateStr = toLocalDateStr(date);
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
                            aspect-square flex items-center justify-center text-sm rounded-lg relative font-medium
                            ${!date ? '' : 'hover:bg-emerald-50 cursor-pointer'}
                            ${isToday(date) ? 'bg-emerald-900 text-white hover:bg-emerald-800 font-bold' : 'text-gray-700'}
                            ${hasAgenda(date) && !isToday(date) ? 'bg-amber-50 text-amber-800 font-semibold' : ''}
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
const AgendaListCard = ({ agenda, icon: Icon, onClick }) => {
    const eventDate = new Date(agenda.event_date + 'T00:00:00');
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return (
        <div
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    {Icon ? <Icon className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                    <p className="text-sm text-amber-600">
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
        </div>
    );
};

export default function AgendaPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedAgenda, setSelectedAgenda] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, agendaRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                specialEventAPI.getAll(true, true),
            ]);
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
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

    const toLocalDateStr = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const filteredAgendas = selectedDate
        ? agendas.filter(a => a.event_date === toLocalDateStr(selectedDate))
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
            <WebsiteNavigation activePage="agenda" mosqueIdentity={mosqueIdentity} />

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

                    {/* Right - Calendar + Agenda */}
                    <div className="space-y-6">
                        <CalendarComponent
                            agendas={agendas}
                            currentDate={currentTime}
                            onDateChange={(date) => setSelectedDate(selectedDate?.toDateString() === date.toDateString() ? null : date)}
                        />

                        {/* Agenda List - directly below calendar */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                {selectedDate ? `Agenda ${selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Agenda Mendatang'}
                            </h2>

                            {filteredAgendas.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredAgendas.map((agenda) => (
                                        <AgendaListCard
                                            key={agenda.id}
                                            agenda={agenda}
                                            icon={getIconForAgenda(agenda.title)}
                                            onClick={() => setSelectedAgenda(agenda)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-6 text-center text-gray-400">
                                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{selectedDate ? 'Tidak ada agenda pada tanggal ini' : 'Belum ada agenda mendatang'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <WebsiteFooter mosqueIdentity={mosqueIdentity} />

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
                        {/* Image */}
                        {selectedAgenda.image_url && (
                            <div className="relative">
                                <img
                                    src={selectedAgenda.image_url}
                                    alt={selectedAgenda.title}
                                    className="w-full h-48 object-cover rounded-t-2xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />
                            </div>
                        )}

                        {/* Close button */}
                        <button
                            onClick={() => setSelectedAgenda(null)}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-1.5 shadow-md transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="p-6">
                            {/* Category badge */}
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-3">
                                {selectedAgenda.category || 'Kegiatan'}
                            </span>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedAgenda.title}</h2>

                            {/* Details grid */}
                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Tanggal</p>
                                        <p className="text-gray-800 font-medium">
                                            {new Date(selectedAgenda.event_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {selectedAgenda.event_time && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Waktu</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.event_time} WIB</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Lokasi</p>
                                        <p className="text-gray-800 font-medium">{selectedAgenda.location || 'Masjid Muktamirin'}</p>
                                    </div>
                                </div>

                                {selectedAgenda.imam && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Imam</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.imam}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedAgenda.speaker && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                                            <Mic className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Penceramah</p>
                                            <p className="text-gray-800 font-medium">{selectedAgenda.speaker}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {selectedAgenda.description && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedAgenda.description}</p>
                                </div>
                            )}

                            {/* Actions */}
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
                                <button
                                    onClick={() => setSelectedAgenda(null)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
