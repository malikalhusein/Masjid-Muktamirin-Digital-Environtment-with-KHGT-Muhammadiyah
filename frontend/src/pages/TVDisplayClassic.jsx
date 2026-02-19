import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { MapPin, Volume2, Settings } from 'lucide-react';
import { 
    formatTime, 
    formatCountdown, 
    getCurrentAndNextPrayer, 
    formatDateIndonesian,
    PRAYER_NAMES,
} from '../lib/utils';
import { getKHGTHijriDate, isRamadan, getNextIslamicEvent } from '../lib/khgtCalendar';

// Default background images untuk slideshow
const DEFAULT_BACKGROUNDS = [
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80', // Blue Mosque
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80', // Mosque sunset
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1920&q=80', // Mosque interior
];

// Prayer Time Card for bottom bar
const PrayerTimeCard = ({ name, time, isActive, isNext, showCountdown, countdownText }) => {
    const baseClasses = "flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all min-w-[120px]";
    const activeClasses = isActive 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" 
        : isNext 
            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
            : "bg-emerald-700/80 text-white";
    
    return (
        <div className={`${baseClasses} ${activeClasses}`} data-testid={`classic-prayer-${name.toLowerCase()}`}>
            <span className="text-sm font-medium uppercase tracking-wider opacity-90">{name}</span>
            <span className="text-3xl font-bold tabular-nums font-heading">{formatTime(time)}</span>
            {showCountdown && countdownText && (
                <span className="text-xs mt-1 opacity-80 tabular-nums">{countdownText}</span>
            )}
        </div>
    );
};

// Content Slideshow for classic layout
const ClassicSlideshow = ({ contents }) => {
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
        <AnimatePresence mode="wait">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full flex items-center justify-center"
            >
                {current.type === 'poster' && current.content_url && (
                    <img 
                        src={current.content_url} 
                        alt={current.title}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    />
                )}
                {current.type === 'announcement' && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-lg text-center shadow-2xl">
                        <h3 className="font-heading text-2xl text-emerald-800 mb-3">{current.title}</h3>
                        <p className="font-body text-lg text-gray-700">{current.text}</p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

// Main Classic Layout Component - Receives props from parent
export default function TVDisplayClassic({ 
    currentTime: propCurrentTime,
    prayerTimes: propPrayerTimes,
    mosqueIdentity: propMosqueIdentity,
    prayerSettings: propPrayerSettings,
    layoutSettings: propLayoutSettings,
    contents: propContents,
    runningTexts: propRunningTexts,
    countdownSeconds: propCountdownSeconds,
    countdownMode: propCountdownMode,
}) {
    // Use props if available, otherwise use local state for standalone mode
    const currentTime = propCurrentTime || new Date();
    const prayerTimes = propPrayerTimes;
    const mosqueIdentity = propMosqueIdentity;
    const prayerSettings = propPrayerSettings;
    const layoutSettings = propLayoutSettings;
    const contents = propContents || [];
    const runningTexts = propRunningTexts || [];
    const countdownSeconds = propCountdownSeconds || 0;
    const countdownMode = propCountdownMode || 'adzan';
    
    const [bgIndex, setBgIndex] = useState(0);
    
    // Get background images - use custom if set, otherwise defaults
    const backgroundImages = layoutSettings?.background_image 
        ? [layoutSettings.background_image]
        : DEFAULT_BACKGROUNDS;
    
    // Rotate background only if multiple images
    useEffect(() => {
        if (backgroundImages.length <= 1) return;
        const timer = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 30000);
        return () => clearInterval(timer);
    }, [backgroundImages.length]);
    
    const { currentPrayer, nextPrayer } = prayerTimes ? getCurrentAndNextPrayer(prayerTimes) : {};
    const hijriDate = getKHGTHijriDate(currentTime);
    const nextEvent = getNextIslamicEvent(currentTime);
    const inRamadan = isRamadan(currentTime);
    
    const marqueeText = runningTexts.length > 0 
        ? runningTexts.map(t => t.text).join('   •   ')
        : 'Selamat datang di Masjid • Jaga kebersihan dan kekhusyukan • Mari tingkatkan ibadah kita';
    
    // Prayer times array for bottom bar (including Imsak for Ramadan)
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
        <div className="relative min-h-screen overflow-hidden" data-testid="tv-display-classic">
            {/* Background Image with overlay */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={bgIndex}
                        src={backgroundImages[bgIndex]}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Top Bar */}
                <header className="flex items-start justify-between p-6 lg:p-8">
                    {/* Clock - Left */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                        <p className="font-heading text-6xl lg:text-7xl text-gray-800 tabular-nums font-bold tracking-tight">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    {/* Mosque Identity - Center */}
                    <div className="text-center">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-xl inline-block">
                            <div className="flex items-center justify-center gap-3 mb-1">
                                {mosqueIdentity?.logo_url ? (
                                    <img src={mosqueIdentity.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <span className="font-arabic text-white text-xl">م</span>
                                    </div>
                                )}
                                <h1 className="font-heading text-2xl lg:text-3xl text-gray-800 font-bold" data-testid="mosque-name">
                                    {mosqueIdentity?.name || 'Masjid Muktamirin'}
                                </h1>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="font-body text-sm">{mosqueIdentity?.address || 'Galur, Kulon Progo'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Date - Right */}
                    <div className="text-right">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                            <p className="font-heading text-xl lg:text-2xl text-amber-600 font-bold" data-testid="hijri-date">
                                {hijriDate.day} {hijriDate.monthName} {hijriDate.year} H
                            </p>
                            <p className="font-body text-gray-600 text-sm" data-testid="gregorian-date">
                                {formatDateIndonesian(currentTime)}
                            </p>
                        </div>
                    </div>
                </header>
                
                {/* Middle Content */}
                <div className="flex-1 flex items-center justify-between px-6 lg:px-8">
                    {/* Mode Muadzin Button - Left */}
                    <div>
                        <button className="bg-gray-800/80 backdrop-blur-sm text-white rounded-full px-5 py-3 flex items-center gap-2 hover:bg-gray-700/80 transition-colors shadow-lg">
                            <Volume2 className="w-5 h-5" />
                            <span className="font-body font-medium">Mode Muadzin</span>
                        </button>
                    </div>
                    
                    {/* Content Slideshow - Center */}
                    <div className="flex-1 max-w-2xl mx-8">
                        {contents.length > 0 && <ClassicSlideshow contents={contents} />}
                    </div>
                    
                    {/* Event Badge - Right */}
                    <div className="flex flex-col gap-4 items-end">
                        {nextEvent && nextEvent.daysUntil <= 90 && (
                            <div className="bg-red-500 text-white rounded-full px-5 py-2 shadow-lg">
                                <span className="font-body font-medium">
                                    {nextEvent.name} -{nextEvent.daysUntil} Hari
                                </span>
                            </div>
                        )}
                        
                        {/* Settings Button */}
                        <a href="/connect" className="bg-white/80 backdrop-blur-sm text-gray-700 rounded-full p-3 hover:bg-white transition-colors shadow-lg">
                            <Settings className="w-6 h-6" />
                        </a>
                    </div>
                </div>
                
                {/* Bottom Prayer Times Bar */}
                <div className="p-6 lg:p-8">
                    <div className="bg-emerald-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {prayerList.map((prayer) => (
                                <PrayerTimeCard
                                    key={prayer.key}
                                    name={prayer.name}
                                    time={prayer.time}
                                    isActive={currentPrayer === prayer.key}
                                    isNext={nextPrayer === prayer.key}
                                    showCountdown={nextPrayer === prayer.key}
                                    countdownText={nextPrayer === prayer.key ? (countdownMode === 'iqomah' ? `Iqomah: ${formatCountdown(countdownSeconds)}` : `-${formatCountdown(countdownSeconds)}`) : null}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Running Text */}
                <div className="bg-emerald-900 py-3">
                    <Marquee speed={50} gradient={false}>
                        <span className="font-body text-lg text-white px-8 uppercase tracking-wider">
                            {marqueeText}
                        </span>
                    </Marquee>
                </div>
            </div>
        </div>
    );
}
