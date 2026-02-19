import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { MapPin } from 'lucide-react';
import { prayerAPI, mosqueAPI, settingsAPI, contentAPI, agendaAPI, runningTextAPI } from '../lib/api';
import { 
    formatTime, 
    formatCountdown, 
    getCurrentAndNextPrayer, 
    parseTimeToday, 
    getTimeDiffSeconds,
    formatDateIndonesian,
    PRAYER_NAMES,
    playBellSound
} from '../lib/utils';
import { getKHGTHijriDate, formatKHGTHijriDate, getNextIslamicEvent, isRamadan } from '../lib/khgtCalendar';

// Quotes for display
const ISLAMIC_QUOTES = [
    { text: 'Peliharalah semua salat(mu), dan (peliharalah) salat wustha (salat lima waktu). Berdirilah untuk Allah (dalam salatmu) dengan khusyu', source: 'TQS. Al-Baqarah [2]: 237' },
    { text: 'Sesungguhnya salat itu mencegah dari perbuatan keji dan mungkar', source: 'TQS. Al-Ankabut [29]: 45' },
    { text: 'Dan dirikanlah salat, tunaikanlah zakat, dan rukuklah beserta orang-orang yang rukuk', source: 'TQS. Al-Baqarah [2]: 43' },
];

// Content Slideshow Component
const ContentSlideshow = ({ contents }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        if (contents.length <= 1) return;
        
        const currentContent = contents[currentIndex];
        const duration = (currentContent?.duration || 10) * 1000;
        
        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % contents.length);
        }, duration);
        
        return () => clearTimeout(timer);
    }, [currentIndex, contents]);
    
    if (contents.length === 0) {
        // Show default nature/mosque image
        return (
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                    alt="Nature"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="font-arabic text-center text-white text-lg">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                    <p className="text-center text-white/80 text-sm mt-1">Dengan nama Allah Yang Maha Pengasih, Maha Penyayang</p>
                </div>
            </div>
        );
    }
    
    const current = contents[currentIndex];
    
    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {current.type === 'poster' && current.content_url && (
                        <img 
                            src={current.content_url} 
                            alt={current.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {current.type === 'announcement' && (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center p-6">
                            <div className="text-center">
                                <h3 className="font-heading text-2xl text-white mb-3">{current.title}</h3>
                                <p className="font-body text-lg text-emerald-100">{current.text}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Prayer Time Pill for bottom bar
const PrayerTimePill = ({ name, time, isActive, isNext }) => {
    const bgClass = isActive 
        ? "bg-emerald-500" 
        : isNext 
            ? "bg-amber-500" 
            : "bg-emerald-600";
    
    return (
        <div className={`${bgClass} rounded-xl px-4 py-3 text-center min-w-[100px] transition-all`}>
            <p className="text-white/90 text-xs font-medium uppercase tracking-wider">{name}</p>
            <p className="text-white text-2xl font-bold tabular-nums font-heading">{formatTime(time)}</p>
        </div>
    );
};

// Main Layout 2 Component (Similar to Al Iftitar ITDA style)
export default function TVDisplayLayout2() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [prayerSettings, setPrayerSettings] = useState(null);
    const [contents, setContents] = useState([]);
    const [runningTexts, setRunningTexts] = useState([]);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [countdownMode, setCountdownMode] = useState('adzan');
    const [bellPlayed, setBellPlayed] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    
    // Rotate quotes
    useEffect(() => {
        const timer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
        }, 20000);
        return () => clearInterval(timer);
    }, []);
    
    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, settingsRes, contentRes, textRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                settingsAPI.getPrayer(),
                contentAPI.getAll(true),
                runningTextAPI.getAll(true),
            ]);
            
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            setPrayerSettings(settingsRes.data);
            setContents(contentRes.data);
            setRunningTexts(textRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);
    
    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Calculate countdown
    useEffect(() => {
        if (!prayerTimes || !prayerSettings) return;
        
        const { nextPrayer, nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
        
        if (nextPrayerTime) {
            const diff = getTimeDiffSeconds(nextPrayerTime, currentTime);
            
            if (diff <= 0 && diff > -60 * (prayerSettings[`iqomah_${nextPrayer}`] || 10)) {
                setCountdownMode('iqomah');
                const iqomahSeconds = (prayerSettings[`iqomah_${nextPrayer}`] || 10) * 60 + diff;
                setCountdownSeconds(Math.max(0, iqomahSeconds));
            } else if (diff > 0) {
                setCountdownMode('adzan');
                setCountdownSeconds(diff);
                
                if (prayerSettings.bell_enabled && diff <= prayerSettings.bell_before_minutes * 60 && diff > (prayerSettings.bell_before_minutes * 60 - 2) && !bellPlayed) {
                    playBellSound();
                    setBellPlayed(true);
                }
            } else {
                setCountdownMode('adzan');
                setBellPlayed(false);
            }
        }
    }, [currentTime, prayerTimes, prayerSettings, bellPlayed]);
    
    const { currentPrayer, nextPrayer } = prayerTimes ? getCurrentAndNextPrayer(prayerTimes) : {};
    const hijriDate = getKHGTHijriDate(currentTime);
    const inRamadan = isRamadan(currentTime);
    const currentQuote = ISLAMIC_QUOTES[quoteIndex];
    
    const marqueeText = runningTexts.length > 0 
        ? runningTexts.map(t => t.text).join('   •   ')
        : 'HARAP TENANG • HARAP HP DINON-AKTIFKAN ATAU SILENT • JAGA KEKHUSYUKAN';
    
    // Prayer times array
    const prayerList = inRamadan 
        ? [
            { key: 'imsak', name: 'Imsak', time: prayerTimes?.subuh ? `${parseInt(prayerTimes.subuh.split(':')[0]).toString().padStart(2, '0')}:${Math.max(0, parseInt(prayerTimes.subuh.split(':')[1]) - 10).toString().padStart(2, '0')}` : '--:--' },
            { key: 'subuh', name: 'Subuh', time: prayerTimes?.subuh },
            { key: 'terbit', name: 'Syuruq', time: prayerTimes?.terbit },
            { key: 'dzuhur', name: 'Dzuhur', time: prayerTimes?.dzuhur },
            { key: 'ashar', name: 'Ashar', time: prayerTimes?.ashar },
            { key: 'maghrib', name: 'Maghrib', time: prayerTimes?.maghrib },
            { key: 'isya', name: 'Isya', time: prayerTimes?.isya },
        ]
        : [
            { key: 'subuh', name: 'Subuh', time: prayerTimes?.subuh },
            { key: 'terbit', name: 'Syuruq', time: prayerTimes?.terbit },
            { key: 'dzuhur', name: 'Dzuhur', time: prayerTimes?.dzuhur },
            { key: 'ashar', name: 'Ashar', time: prayerTimes?.ashar },
            { key: 'maghrib', name: 'Maghrib', time: prayerTimes?.maghrib },
            { key: 'isya', name: 'Isya', time: prayerTimes?.isya },
        ];
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col" data-testid="tv-display-layout2">
            {/* Top Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
                {/* Date - Left */}
                <div>
                    <p className="font-body text-gray-700">{formatDateIndonesian(currentTime)}</p>
                    <p className="font-body text-emerald-600 font-medium" data-testid="hijri-date">
                        {hijriDate.day} {hijriDate.monthName} {hijriDate.year}
                    </p>
                </div>
                
                {/* Mosque Name - Center */}
                <div className="text-center flex items-center gap-3">
                    {mosqueIdentity?.logo_url ? (
                        <img src={mosqueIdentity.logo_url} alt="Logo" className="w-12 h-12 rounded object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded bg-emerald-600 flex items-center justify-center">
                            <span className="font-arabic text-white text-2xl">م</span>
                        </div>
                    )}
                    <div className="text-left">
                        <h1 className="font-heading text-2xl lg:text-3xl text-gray-800 font-bold" data-testid="mosque-name">
                            {mosqueIdentity?.name || 'Masjid Muktamirin'}
                        </h1>
                        <p className="text-gray-500 text-sm">{mosqueIdentity?.address || 'Galur, Kulon Progo'}</p>
                    </div>
                </div>
                
                {/* Debug badge - Right */}
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">DEBUG</div>
            </header>
            
            {/* Main Content */}
            <div className="flex-1 flex p-6 gap-6">
                {/* Left Panel - Clock, Countdown, Quote */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Clock Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <p className="font-heading text-7xl text-emerald-700 font-bold tabular-nums text-center">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    {/* Countdown Card */}
                    <div className="bg-emerald-600 rounded-2xl p-4 shadow-lg">
                        <p className="text-emerald-100 text-lg font-medium">
                            {countdownMode === 'iqomah' ? 'Iqomah' : PRAYER_NAMES[nextPrayer]?.id || 'Sholat'} - {formatCountdown(countdownSeconds)}
                        </p>
                    </div>
                    
                    {/* Quote Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg flex-1">
                        <p className="text-gray-700 font-body text-sm leading-relaxed">
                            {currentQuote.text}
                        </p>
                        <p className="text-emerald-600 text-xs mt-3 font-medium">{currentQuote.source}</p>
                    </div>
                </div>
                
                {/* Right Panel - Content Slideshow */}
                <div className="flex-1">
                    <ContentSlideshow contents={contents} />
                </div>
            </div>
            
            {/* Bottom Prayer Times Bar */}
            <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-2">
                    {prayerList.map((prayer) => (
                        <PrayerTimePill
                            key={prayer.key}
                            name={prayer.name}
                            time={prayer.time}
                            isActive={currentPrayer === prayer.key}
                            isNext={nextPrayer === prayer.key}
                        />
                    ))}
                </div>
            </div>
            
            {/* Running Text */}
            <div className="bg-red-600 py-2">
                <Marquee speed={60} gradient={false}>
                    <span className="font-body text-white text-base uppercase tracking-wider px-8">
                        {marqueeText}
                    </span>
                </Marquee>
            </div>
        </div>
    );
}
