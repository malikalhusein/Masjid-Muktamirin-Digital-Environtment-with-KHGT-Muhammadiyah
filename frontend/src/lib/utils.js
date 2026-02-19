import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Hijri month names in Arabic and Indonesian
export const HIJRI_MONTHS = {
    ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
    id: ['Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulqaidah', 'Dzulhijjah'],
};

// Gregorian month names in Indonesian
export const GREGORIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Day names in Indonesian
export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Prayer names in Indonesian and Arabic
export const PRAYER_NAMES = {
    subuh: { id: 'Subuh', ar: 'الفجر' },
    terbit: { id: 'Terbit', ar: 'الشروق' },
    dhuha: { id: 'Dhuha', ar: 'الضحى' },
    dzuhur: { id: 'Dzuhur', ar: 'الظهر' },
    ashar: { id: 'Ashar', ar: 'العصر' },
    maghrib: { id: 'Maghrib', ar: 'المغرب' },
    isya: { id: 'Isya', ar: 'العشاء' },
};

// Format time to HH:MM
export function formatTime(timeStr) {
    if (!timeStr) return '--:--';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}

// Parse time string to Date object for today
export function parseTimeToday(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

// Calculate time difference in seconds
export function getTimeDiffSeconds(targetTime, currentTime = new Date()) {
    if (!targetTime) return 0;
    return Math.floor((targetTime - currentTime) / 1000);
}

// Format seconds to HH:MM:SS
export function formatCountdown(seconds) {
    if (seconds < 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Get current prayer and next prayer
export function getCurrentAndNextPrayer(prayerTimes) {
    const now = new Date();
    const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    let currentPrayer = null;
    let nextPrayer = null;
    let nextPrayerTime = null;
    
    for (let i = 0; i < prayers.length; i++) {
        const prayerKey = prayers[i];
        const prayerTime = parseTimeToday(prayerTimes[prayerKey]);
        
        if (prayerTime && now >= prayerTime) {
            currentPrayer = prayerKey;
            
            // Check if next prayer exists today
            if (i < prayers.length - 1) {
                nextPrayer = prayers[i + 1];
                nextPrayerTime = parseTimeToday(prayerTimes[prayers[i + 1]]);
            } else {
                // Next prayer is Subuh tomorrow
                nextPrayer = 'subuh';
                nextPrayerTime = parseTimeToday(prayerTimes.subuh);
                if (nextPrayerTime) {
                    nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
                }
            }
        }
    }
    
    // If before Subuh
    if (!currentPrayer) {
        nextPrayer = 'subuh';
        nextPrayerTime = parseTimeToday(prayerTimes.subuh);
    }
    
    return { currentPrayer, nextPrayer, nextPrayerTime };
}

// Simple Hijri date calculation (approximate)
// For accurate calculation, use the KHGT API or library
export function getApproximateHijriDate(date = new Date()) {
    // This is a simplified approximation
    // The Islamic calendar started on July 16, 622 CE
    const hijriEpoch = new Date(622, 6, 16);
    const daysSinceEpoch = Math.floor((date - hijriEpoch) / (1000 * 60 * 60 * 24));
    
    // Average length of a Hijri year is about 354.37 days
    const hijriYears = Math.floor(daysSinceEpoch / 354.37);
    const remainingDays = daysSinceEpoch % 354.37;
    
    // Average length of a Hijri month is about 29.53 days
    const hijriMonths = Math.floor(remainingDays / 29.53);
    const hijriDays = Math.floor(remainingDays % 29.53) + 1;
    
    return {
        day: hijriDays,
        month: (hijriMonths % 12) + 1,
        year: hijriYears + 1,
        monthNameAr: HIJRI_MONTHS.ar[hijriMonths % 12],
        monthNameId: HIJRI_MONTHS.id[hijriMonths % 12],
    };
}

// Format date to Indonesian format
export function formatDateIndonesian(date = new Date()) {
    const dayName = DAY_NAMES[date.getDay()];
    const day = date.getDate();
    const month = GREGORIAN_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
}

// Check if we're in Ramadhan (approximate)
export function isRamadhan() {
    const hijri = getApproximateHijriDate();
    return hijri.month === 9;
}

// Play bell sound
export function playBellSound() {
    try {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.error('Error playing bell sound:', e);
    }
}
