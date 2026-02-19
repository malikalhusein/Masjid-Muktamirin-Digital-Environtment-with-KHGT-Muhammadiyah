import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, Moon, ExternalLink, Filter } from 'lucide-react';
import { prayerAPI, mosqueAPI, agendaAPI } from '../../lib/api';
import { formatDateIndonesian, PRAYER_NAMES, getCurrentAndNextPrayer } from '../../lib/utils';
import { getKHGTHijriDate, isRamadan } from '../../lib/khgtCalendar';

// Simplified Calendar View
const CalendarView = ({ agendas, currentDate }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    const getAgendaForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return agendas.filter(a => a.event_date === dateStr);
    };
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date().getDate();
    const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
    
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{monthNames[month]} {year}</h3>
            <div className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
                ))}
                {days.map((day, index) => {
                    const dayAgendas = getAgendaForDay(day);
                    const isToday = isCurrentMonth && day === today;
                    return (
                        <div 
                            key={index} 
                            className={`text-center py-2 text-sm rounded-lg relative ${
                                day ? 'hover:bg-gray-100 cursor-pointer' : ''
                            } ${isToday ? 'bg-emerald-100 text-emerald-700 font-bold' : ''}`}
                        >
                            {day}
                            {dayAgendas.length > 0 && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Prayer Times Table
const PrayerTimesTable = ({ prayerTimes }) => {
    const prayers = [
        { key: 'imsak', name: 'Imsak', time: prayerTimes?.imsak },
        { key: 'subuh', name: 'Subuh', time: prayerTimes?.subuh },
        { key: 'terbit', name: 'Syuruq', time: prayerTimes?.terbit },
        { key: 'dzuhur', name: 'Dzuhur', time: prayerTimes?.dzuhur },
        { key: 'ashar', name: 'Ashar', time: prayerTimes?.ashar },
        { key: 'maghrib', name: 'Maghrib', time: prayerTimes?.maghrib },
        { key: 'isya', name: 'Isya', time: prayerTimes?.isya },
    ];
    
    const { nextPrayer } = getCurrentAndNextPrayer(prayerTimes);
    
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Sholat Hari Ini</h3>
            <div className="space-y-2">
                {prayers.map(prayer => (
                    <div 
                        key={prayer.key}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                            nextPrayer === prayer.key ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-50'
                        }`}
                    >
                        <span className="font-medium">{prayer.name}</span>
                        <span className="font-bold tabular-nums">{prayer.time || '--:--'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AgendaPage() {
    const [currentDate] = useState(new Date());
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
            setAgendas(agendaRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { fetchData(); }, [fetchData]);
    
    const hijriDate = getKHGTHijriDate(currentDate);
    const inRamadan = isRamadan(currentDate);
    
    const formatAgendaDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50" data-testid="agenda-page-public">
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
                            <Link to="/homepage" className="text-gray-600 hover:text-emerald-600">Home</Link>
                            <Link to="/homepage/agenda" className="text-emerald-600 font-medium">Agenda</Link>
                            {inRamadan && <Link to="/ramadan" className="text-amber-600 hover:text-amber-700 flex items-center gap-1"><Moon className="w-4 h-4" />Ramadan</Link>}
                            <Link to="/homepage/about" className="text-gray-600 hover:text-emerald-600">Tentang Kami</Link>
                            <Link to="/" target="_blank" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4" />TV Display
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Header */}
            <div className="bg-emerald-700 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/homepage" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white mb-4">
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Home
                    </Link>
                    <h1 className="text-3xl font-bold">Agenda & Jadwal Sholat</h1>
                    <p className="text-emerald-200 mt-2">{formatDateIndonesian(currentDate)} / {hijriDate.day} {hijriDate.monthName} {hijriDate.year} H</p>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left - Calendar and Prayer Times */}
                    <div className="space-y-6">
                        <CalendarView agendas={agendas} currentDate={currentDate} />
                        <PrayerTimesTable prayerTimes={prayerTimes} />
                    </div>
                    
                    {/* Right - Agenda List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Daftar Agenda</h2>
                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                                    <Filter className="w-4 h-4" /> Filter
                                </button>
                            </div>
                            
                            {agendas.length > 0 ? (
                                <div className="space-y-4">
                                    {agendas.map((agenda) => (
                                        <div key={agenda.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="bg-emerald-100 rounded-lg p-3 text-center min-w-[70px]">
                                                <p className="text-2xl font-bold text-emerald-700">{new Date(agenda.event_date).getDate()}</p>
                                                <p className="text-xs text-emerald-600 uppercase">{new Date(agenda.event_date).toLocaleDateString('id-ID', { month: 'short' })}</p>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 text-lg">{agenda.title}</h3>
                                                {agenda.description && <p className="text-gray-500 mt-1">{agenda.description}</p>}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatAgendaDate(agenda.event_date)}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{agenda.event_time}</span>
                                                    {agenda.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{agenda.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500">Belum ada agenda terjadwal</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
