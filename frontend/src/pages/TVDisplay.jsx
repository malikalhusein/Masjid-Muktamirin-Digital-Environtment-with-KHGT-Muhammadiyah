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
    PRAYER_NAMES,
    playNotificationSound,
    SOUND_TYPES
} from '../lib/utils';
import { getKHGTHijriDate, isRamadan, getNextIslamicEvent } from '../lib/khgtCalendar';

// Import layout components
import TVDisplayClassic from './TVDisplayClassic';
import TVDisplayLayout2 from './TVDisplayLayout2';

// Prayer Card Component for Modern Layout
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
const CountdownDisplay = ({ seconds, label, isUrgent, colorClass }) => {
    return (
        <div className="text-center" data-testid="countdown-display">
            <p className="text-slate-400 text-lg lg:text-xl font-body uppercase tracking-wider mb-2">
                {label}
            </p>
            <p className={`font-heading text-5xl lg:text-7xl xl:text-8xl tabular-nums ${colorClass || (isUrgent ? 'countdown-urgent' : 'text-white')}`}>
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

// Modern Layout Component
const ModernLayout = ({ 
    currentTime, prayerTimes, mosqueIdentity, prayerSettings, 
    contents, agendas, runningTexts, countdownSeconds, countdownMode, countdownLabel 
}) => {
    const { currentPrayer, nextPrayer } = prayerTimes ? getCurrentAndNextPrayer(prayerTimes) : {};
    const hijriDate = getKHGTHijriDate(currentTime);
    const inRamadan = isRamadan(currentTime);
    
    const marqueeText = runningTexts.length > 0 
        ? runningTexts.map(t => t.text).join('   •   ')
        : 'Selamat datang di Masjid • Jaga kebersihan dan kekhusyukan • Mari tingkatkan ibadah kita';
    
    // Determine countdown display color based on mode
    const getCountdownColor = () => {
        switch (countdownMode) {
            case 'jeda_adzan': return 'text-gold-400';
            case 'iqomah': return 'text-emerald-400';
            default: return countdownSeconds < 300 ? 'text-red-400' : 'text-white';
        }
    };
    
    return (
        <div className="tv-display min-h-screen p-6 lg:p-8 xl:p-12" data-testid="tv-display-modern">
            {/* Header */}
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
                
                <div className="text-right">
                    <p className="font-body text-lg lg:text-xl text-slate-300" data-testid="gregorian-date">
                        {formatDateIndonesian(currentTime)}
                    </p>
                    <p className="font-arabic text-xl lg:text-2xl text-emerald-400 mt-1" data-testid="hijri-date">
                        {hijriDate.day} {hijriDate.monthNameAr} {hijriDate.year} هـ
                    </p>
                    {inRamadan && (
                        <p className="text-gold-400 text-sm mt-1">Ramadan Mubarak!</p>
                    )}
                </div>
            </header>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 lg:space-y-6">
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <MainClock time={currentTime} />
                    </div>
                    
                    <div className="glass-card rounded-2xl p-6 lg:p-8">
                        <CountdownDisplay 
                            seconds={countdownSeconds}
                            label={countdownLabel || `Menuju ${PRAYER_NAMES[nextPrayer]?.id || 'Sholat'}`}
                            isUrgent={countdownSeconds < 300 && countdownMode === 'adzan'}
                            colorClass={getCountdownColor()}
                        />
                        {countdownMode === 'jeda_adzan' && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-gold-400">
                                <Bell className="w-4 h-4 animate-pulse" />
                                <span className="text-sm font-medium">Adzan Berkumandang</span>
                            </div>
                        )}
                        {countdownMode === 'iqomah' && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Bersiap Sholat Berjamaah</span>
                            </div>
                        )}
                    </div>
                    
                    <AgendaList agendas={agendas} />
                </div>
                
                {/* Center Column - Prayer Times */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-5">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                        {inRamadan && (
                            <PrayerCard 
                                name="Imsak" 
                                time={prayerTimes?.subuh ? `${parseInt(prayerTimes.subuh.split(':')[0]).toString().padStart(2, '0')}:${Math.max(0, parseInt(prayerTimes.subuh.split(':')[1]) - 10).toString().padStart(2, '0')}` : '--:--'}
                                arabicName="الإمساك"
                                isActive={false}
                                isNext={false}
                            />
                        )}
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
};

// Main TV Display Component - Loads correct layout based on settings
export default function TVDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [mosqueIdentity, setMosqueIdentity] = useState(null);
    const [prayerSettings, setPrayerSettings] = useState(null);
    const [layoutSettings, setLayoutSettings] = useState(null);
    const [contents, setContents] = useState([]);
    const [agendas, setAgendas] = useState([]);
    const [runningTexts, setRunningTexts] = useState([]);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [countdownMode, setCountdownMode] = useState('adzan'); // 'adzan', 'jeda_adzan', 'iqomah', 'sholat'
    const [countdownLabel, setCountdownLabel] = useState('');
    const [soundsPlayed, setSoundsPlayed] = useState({
        preAdzan: false,
        adzan: false,
        preIqamah: false,
        iqamah: false,
    });
    const [loading, setLoading] = useState(true);
    
    // Fetch all data
    const fetchData = useCallback(async () => {
        try {
            const [prayerRes, mosqueRes, prayerSettingsRes, layoutRes, contentRes, agendaRes, textRes] = await Promise.all([
                prayerAPI.getTimes(),
                mosqueAPI.getIdentity(),
                settingsAPI.getPrayer(),
                settingsAPI.getLayout(),
                contentAPI.getAll(true),
                agendaAPI.getAll(true, true),
                runningTextAPI.getAll(true),
            ]);
            
            setPrayerTimes(prayerRes.data);
            setMosqueIdentity(mosqueRes.data);
            setPrayerSettings(prayerSettingsRes.data);
            setLayoutSettings(layoutRes.data);
            setContents(contentRes.data);
            setAgendas(agendaRes.data);
            setRunningTexts(textRes.data);
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
    
    // Update clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Calculate countdown with calibration settings
    useEffect(() => {
        if (!prayerTimes || !prayerSettings) return;
        
        const { nextPrayer, nextPrayerTime } = getCurrentAndNextPrayer(prayerTimes);
        if (!nextPrayerTime || !nextPrayer) return;
        
        // Get calibration for this prayer
        const calibration = prayerSettings[`calibration_${nextPrayer}`] || {
            pre_adzan: 1,
            jeda_adzan: 3,
            pre_iqamah: prayerSettings[`iqomah_${nextPrayer}`] || 10,
            jeda_sholat: 10,
        };
        
        const diff = getTimeDiffSeconds(nextPrayerTime, currentTime);
        const preAdzanSeconds = calibration.pre_adzan * 60;
        const jedaAdzanSeconds = calibration.jeda_adzan * 60;
        const preIqamahSeconds = calibration.pre_iqamah * 60;
        const prayerName = PRAYER_NAMES[nextPrayer]?.id || nextPrayer;
        
        // Timeline: PreAdzan -> Adzan -> JedaAdzan -> Iqamah -> Sholat
        
        if (diff > preAdzanSeconds) {
            // Before pre-adzan warning
            setCountdownMode('adzan');
            setCountdownSeconds(diff);
            setCountdownLabel(`Menuju ${prayerName}`);
            
            // Reset sounds for new prayer cycle
            if (diff > preAdzanSeconds + 60) {
                setSoundsPlayed({
                    preAdzan: false,
                    adzan: false,
                    preIqamah: false,
                    iqamah: false,
                });
            }
        } else if (diff > 0 && diff <= preAdzanSeconds) {
            // Pre-adzan warning period
            setCountdownMode('adzan');
            setCountdownSeconds(diff);
            setCountdownLabel(`⏰ ${prayerName} Sebentar Lagi`);
            
            // Play pre-adzan sound once
            if (!soundsPlayed.preAdzan && prayerSettings.sound_pre_adzan !== false) {
                playNotificationSound(SOUND_TYPES.PRE_ADZAN);
                setSoundsPlayed(prev => ({ ...prev, preAdzan: true }));
            }
        } else if (diff <= 0 && diff > -jedaAdzanSeconds) {
            // Adzan time / Jeda adzan
            setCountdownMode('jeda_adzan');
            setCountdownSeconds(jedaAdzanSeconds + diff);
            setCountdownLabel(`🔊 Adzan ${prayerName}`);
            
            // Play adzan sound once
            if (!soundsPlayed.adzan && prayerSettings.sound_adzan !== false) {
                playNotificationSound(SOUND_TYPES.ADZAN);
                setSoundsPlayed(prev => ({ ...prev, adzan: true }));
            }
        } else if (diff <= -jedaAdzanSeconds && diff > -(jedaAdzanSeconds + preIqamahSeconds)) {
            // Iqamah countdown
            const iqamahRemaining = preIqamahSeconds + jedaAdzanSeconds + diff;
            setCountdownMode('iqomah');
            setCountdownSeconds(Math.max(0, iqamahRemaining));
            setCountdownLabel(`Iqomah ${prayerName}`);
            
            // Play pre-iqamah sound when 1 minute left
            if (!soundsPlayed.preIqamah && iqamahRemaining <= 60 && iqamahRemaining > 58 && prayerSettings.sound_pre_iqamah !== false) {
                playNotificationSound(SOUND_TYPES.PRE_IQAMAH);
                setSoundsPlayed(prev => ({ ...prev, preIqamah: true }));
            }
            
            // Play iqamah sound when countdown ends
            if (!soundsPlayed.iqamah && iqamahRemaining <= 2 && prayerSettings.sound_iqamah !== false) {
                playNotificationSound(SOUND_TYPES.IQAMAH);
                setSoundsPlayed(prev => ({ ...prev, iqamah: true }));
            }
        } else {
            // After iqamah - waiting for next prayer
            setCountdownMode('adzan');
            setCountdownSeconds(0);
            setCountdownLabel('Sholat Berlangsung');
        }
    }, [currentTime, prayerTimes, prayerSettings, soundsPlayed]);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }
    
    // Render based on layout setting
    const selectedTheme = layoutSettings?.theme || 'modern';
    
    // Pass common props to all layouts
    const commonProps = {
        currentTime,
        prayerTimes,
        mosqueIdentity,
        prayerSettings,
        layoutSettings,
        contents,
        agendas,
        runningTexts,
        countdownSeconds,
        countdownMode,
        countdownLabel,
    };
    
    if (selectedTheme === 'classic') {
        return <TVDisplayClassic {...commonProps} />;
    }
    
    if (selectedTheme === 'layout2') {
        return <TVDisplayLayout2 {...commonProps} />;
    }
    
    // Default to modern layout
    return (
        <ModernLayout {...commonProps} />
    );
}
