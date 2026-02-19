import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { Clock, MapPin, Bell, Calendar, ChevronRight } from 'lucide-react';
import { prayerAPI, mosqueAPI, settingsAPI, contentAPI, agendaAPI, runningTextAPI } from '../lib/api';
import { 
    formatTime, 
    formatCountdown, 
    getCurrentAndNextPrayer, 
    parseTimeToday, 
    getTimeDiffSeconds,
    formatDateIndonesian,
    getApproximateHijriDate,
    PRAYER_NAMES,
    playBellSound
} from '../lib/utils';

// Prayer Card Component
const PrayerCard = ({ name, time, isActive, isNext, arabicName }) => {
    return (
        <motion.div
            className={`
                relative overflow-hidden rounded-xl p-4 lg:p-6
                ${isActive ? 'prayer-active' : isNext ? 'prayer-upcoming' : 'glass-card'}
                transition-all duration-300
            `}
            whileHover={{ scale: 1.02 }}
            data-testid={`prayer-card-${name.toLowerCase()}`}
        >
            <div className="flex flex-col items-center text-center">
                <span className="text-slate-400 text-sm lg:text-base font-body uppercase tracking-wider">
                    {name}
                </span>
                <span className="font-arabic text-emerald-300/60 text-lg lg:text-xl mt-1">
                    {arabicName}
                </span>
                <span className="font-heading text-3xl lg:text-5xl text-white mt-2 tabular-nums">
                    {formatTime(time)}
                </span>
                {isActive && (
                    <span className="mt-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-300 text-xs lg:text-sm uppercase tracking-wider">
                        Waktu Sholat
                    </span>
                )}
                {isNext && (
                    <span className="mt-2 px-3 py-1 bg-gold-500/30 rounded-full text-gold-300 text-xs lg:text-sm uppercase tracking-wider">
                        Berikutnya
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// Countdown Component
const CountdownDisplay = ({ seconds, label, isUrgent }) => {
    return (
        <div className="text-center" data-testid="countdown-display">
            <p className="text-slate-400 text-lg lg:text-xl font-body uppercase tracking-wider mb-2">
                {label}
            </p>
            <p className={`font-heading text-5xl lg:text-7xl xl:text-8xl tabular-nums ${isUrgent ? 'countdown-urgent' : 'text-white'}`}>
                {formatCountdown(seconds)}
            </p>
        </div>
    );
};

// Clock Component
const MainClock = ({ time }) => {
    return (
        <div className="text-center" data-testid="main-clock">
            <p className="font-heading text-7xl lg:text-9xl xl:text-[10rem] text-white tabular-nums tracking-tighter">
                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-heading text-4xl lg:text-6xl text-slate-400 tabular-nums">
                {time.toLocaleTimeString('id-ID', { second: '2-digit' }).split(':').pop()}
            </p>
        </div>
    );
};

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
    
    if (contents.length === 0) return null;
    
    const current = contents[currentIndex];
    
    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl glass-card" data-testid="content-slideshow">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                >
                    {current.type === 'poster' && current.content_url && (
                        <img 
                            src={current.content_url} 
                            alt={current.title}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    )}
                    {current.type === 'announcement' && (
                        <div className="text-center p-8">
                            <h3 className="font-heading text-3xl lg:text-4xl text-gold-400 mb-4">{current.title}</h3>
                            <p className="font-body text-xl lg:text-2xl text-slate-200">{current.text}</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            
            {/* Progress indicators */}
            {contents.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {contents.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Agenda List Component
const AgendaList = ({ agendas }) => {
    if (agendas.length === 0) return null;
    
    return (
        <div className="glass-card rounded-xl p-4 lg:p-6" data-testid="agenda-list">
            <h3 className="font-heading text-xl lg:text-2xl text-emerald-400 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Agenda Masjid
            </h3>
            <div className="space-y-3">
                {agendas.slice(0, 3).map((agenda) => (
                    <div key={agenda.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <ChevronRight className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-body text-white text-sm lg:text-base">{agenda.title}</p>
                            <p className="text-slate-400 text-xs lg:text-sm">
                                {agenda.event_date} • {agenda.event_time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main TV Display Component
export default function TVDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [prayerSettings, setPrayerSettings] = useState(null);
    const [contents, setContents] = useState([]);
    const [agendas, setAgendas] = useState([]);
    const [runningTexts, setRunningTexts] = useState([]);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [countdownMode, setCountdownMode] = useState('adzan'); // 'adzan' or 'iqomah'
    const [bellPlayed, setBellPlayed] = useState(false);
    
    // Fetch all data
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, settingsRes, contentRes, agendaRes, textRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                settingsAPI.getPrayer(),
                contentAPI.getAll(true),
                agendaAPI.getAll(true, true),
                runningTextAPI.getAll(true),
            ]);
            
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            setPrayerSettings(settingsRes.data);
            setContents(contentRes.data);
            setAgendas(agendaRes.data);
            setRunningTexts(textRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);
    
    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Calculate countdown
    useEffect(() => {
        if (!prayerTimes || !prayerSettings) return;
        
        const { nextPrayer, nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
        
        if (nextPrayerTime) {
            const diff = getTimeDiffSeconds(nextPrayerTime, currentTime);
            
            // Check if we should switch to iqomah mode
            if (diff <= 0 && diff > -60 * prayerSettings[`iqomah_${nextPrayer}`]) {
                setCountdownMode('iqomah');
                const iqomahSeconds = prayerSettings[`iqomah_${nextPrayer}`] * 60 + diff;
                setCountdownSeconds(Math.max(0, iqomahSeconds));
            } else if (diff > 0) {
                setCountdownMode('adzan');
                setCountdownSeconds(diff);
                
                // Play bell 5 minutes before prayer
                if (prayerSettings.bell_enabled && diff <= prayerSettings.bell_before_minutes * 60 && diff > (prayerSettings.bell_before_minutes * 60 - 2) && !bellPlayed) {
                    playBellSound();
                    setBellPlayed(true);
                }
            } else {
                // Reset for next prayer
                setCountdownMode('adzan');
                setBellPlayed(false);
            }
        }
    }, [currentTime, prayerTimes, prayerSettings, bellPlayed]);
    
    const { currentPrayer, nextPrayer } = prayerTimes ? getCurrentAndNextPrayer(prayerTimes) : {};
    const hijriDate = getApproximateHijriDate(currentTime);
    
    // Prepare running text
    const marqueeText = runningTexts.length > 0 
        ? runningTexts.map(t => t.text).join('   •   ')
        : 'Selamat datang di Masjid • Jaga kebersihan dan kekhusyukan • Mari tingkatkan ibadah kita';
    
    return (
        <div className="tv-display min-h-screen p-6 lg:p-8 xl:p-12" data-testid="tv-display">
            {/* Header - Mosque Identity */}
            <header className="flex items-center justify-between mb-6 lg:mb-8">
                <div className="flex items-center gap-4 lg:gap-6">
                    {mosqueIdentity?.logo_url ? (
                        <img 
                            src={mosqueIdentity.logo_url} 
                            alt="Logo Masjid" 
                            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-emerald-500"
                        />
                    ) : (
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-500">
                            <span className="font-arabic text-2xl lg:text-3xl text-emerald-300">م</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-heading text-2xl lg:text-4xl xl:text-5xl text-white uppercase tracking-wide" data-testid="mosque-name">
                            {mosqueIdentity?.name || 'Masjid Muktamirin'}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="font-body text-sm lg:text-base" data-testid="mosque-address">
                                {mosqueIdentity?.address || 'Galur, Kulon Progo'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Date Display */}
                <div className="text-right">
                    <p className="font-body text-lg lg:text-xl text-slate-300" data-testid="gregorian-date">
                        {formatDateIndonesian(currentTime)}
                    </p>
                    <p className="font-arabic text-xl lg:text-2xl text-emerald-400 mt-1" data-testid="hijri-date">
                        {hijriDate.day} {hijriDate.monthNameAr} {hijriDate.year} هـ
                    </p>
                </div>
            </header>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
                {/* Left Column - Clock and Countdown */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 lg:space-y-6">
                    {/* Main Clock */}
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <MainClock time={currentTime} />
                    </div>
                    
                    {/* Countdown */}
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <CountdownDisplay 
                            seconds={countdownSeconds}
                            label={countdownMode === 'adzan' 
                                ? `Menuju ${PRAYER_NAMES[nextPrayer]?.id || 'Sholat'}`
                                : `Iqomah ${PRAYER_NAMES[nextPrayer]?.id || ''}`
                            }
                            isUrgent={countdownSeconds < 300}
                        />
                        {prayerSettings?.bell_enabled && countdownMode === 'adzan' && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                                <Bell className="w-4 h-4" />
                                <span className="text-sm">Bell {prayerSettings.bell_before_minutes} menit sebelum</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Agenda */}
                    <AgendaList agendas={agendas} />
                </div>
                
                {/* Center Column - Prayer Times */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-5">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                        <PrayerCard 
                            name="Subuh" 
                            time={prayerTimes?.subuh}
                            arabicName={PRAYER_NAMES.subuh.ar}
                            isActive={currentPrayer === 'subuh'}
                            isNext={nextPrayer === 'subuh'}
                        />
                        <PrayerCard 
                            name="Dzuhur" 
                            time={prayerTimes?.dzuhur}
                            arabicName={PRAYER_NAMES.dzuhur.ar}
                            isActive={currentPrayer === 'dzuhur'}
                            isNext={nextPrayer === 'dzuhur'}
                        />
                        <PrayerCard 
                            name="Ashar" 
                            time={prayerTimes?.ashar}
                            arabicName={PRAYER_NAMES.ashar.ar}
                            isActive={currentPrayer === 'ashar'}
                            isNext={nextPrayer === 'ashar'}
                        />
                        <PrayerCard 
                            name="Maghrib" 
                            time={prayerTimes?.maghrib}
                            arabicName={PRAYER_NAMES.maghrib.ar}
                            isActive={currentPrayer === 'maghrib'}
                            isNext={nextPrayer === 'maghrib'}
                        />
                        <PrayerCard 
                            name="Isya" 
                            time={prayerTimes?.isya}
                            arabicName={PRAYER_NAMES.isya.ar}
                            isActive={currentPrayer === 'isya'}
                            isNext={nextPrayer === 'isya'}
                        />
                        <PrayerCard 
                            name="Terbit" 
                            time={prayerTimes?.terbit}
                            arabicName={PRAYER_NAMES.terbit.ar}
                            isActive={false}
                            isNext={false}
                        />
                    </div>
                </div>
                
                {/* Right Column - Content Slideshow */}
                <div className="col-span-12 lg:col-span-3 min-h-[300px] lg:min-h-[400px]">
                    {contents.length > 0 ? (
                        <ContentSlideshow contents={contents} />
                    ) : (
                        <div className="glass-card rounded-xl h-full flex items-center justify-center">
                            <p className="text-slate-500 font-body">Konten akan ditampilkan di sini</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Running Text Footer */}
            <div className="fixed bottom-0 left-0 right-0 running-text-container py-3 lg:py-4">
                <Marquee speed={50} gradient={false}>
                    <span className="font-body text-lg lg:text-xl text-emerald-100 px-4">
                        {marqueeText}
                    </span>
                </Marquee>
            </div>
        </div>
    );
}
