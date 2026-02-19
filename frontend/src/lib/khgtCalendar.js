// Konversi tanggal Hijriyah berdasarkan KHGT Muhammadiyah 1447 H
// Data diambil dari https://hisabmu.com/khgt/

// Tabel konversi bulan-bulan Hijriyah 1447 H ke Masehi
// Sumber: https://hisabmu.com/khgt/ - KHGT Muhammadiyah
// Tanggal 18/1 pada tabel jadwal sholat berarti 18 Feb = 1 Ramadan
export const KHGT_1447_CALENDAR = {
    // Format: [startGregorianDate, endGregorianDate] (inclusive)
    // Berdasarkan hisabmu.com/khgt: 1 Ramadan 1447 = 18 Feb 2026
    1: { name: 'Muharram', nameAr: 'محرم', start: '2025-06-27', end: '2025-07-26' },
    2: { name: 'Shafar', nameAr: 'صفر', start: '2025-07-27', end: '2025-08-24' },
    3: { name: 'Rabiul Awal', nameAr: 'ربيع الأول', start: '2025-08-25', end: '2025-09-23' },
    4: { name: 'Rabiul Akhir', nameAr: 'ربيع الآخر', start: '2025-09-24', end: '2025-10-22' },
    5: { name: 'Jumadil Awal', nameAr: 'جمادى الأولى', start: '2025-10-23', end: '2025-11-21' },
    6: { name: 'Jumadil Akhir', nameAr: 'جمادى الآخرة', start: '2025-11-22', end: '2025-12-20' },
    7: { name: 'Rajab', nameAr: 'رجب', start: '2025-12-21', end: '2026-01-19' },
    8: { name: 'Syakban', nameAr: 'شعبان', start: '2026-01-20', end: '2026-02-17' },
    9: { name: 'Ramadan', nameAr: 'رمضان', start: '2026-02-18', end: '2026-03-19' },
    10: { name: 'Syawal', nameAr: 'شوال', start: '2026-03-20', end: '2026-04-17' },
    11: { name: 'Zulkaidah', nameAr: 'ذو القعدة', start: '2026-04-18', end: '2026-05-17' },
    12: { name: 'Zulhijah', nameAr: 'ذو الحجة', start: '2026-05-18', end: '2026-06-15' },
};

// Fungsi untuk menghitung tanggal Hijriyah KHGT dari tanggal Masehi
export function getKHGTHijriDate(gregorianDate = new Date()) {
    // Gunakan tanggal lokal, bukan UTC
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth(); // 0-indexed
    const day = gregorianDate.getDate();
    
    // Buat tanggal untuk perbandingan (tanpa timezone issues)
    const targetDate = new Date(year, month, day, 12, 0, 0); // noon untuk avoid timezone issues
    
    // Cari bulan yang sesuai
    for (const [monthNum, monthData] of Object.entries(KHGT_1447_CALENDAR)) {
        const startParts = monthData.start.split('-').map(Number);
        const endParts = monthData.end.split('-').map(Number);
        
        const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2], 12, 0, 0);
        const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2], 12, 0, 0);
        
        if (targetDate >= startDate && targetDate <= endDate) {
            // Hitung hari ke berapa dalam bulan ini
            // Gunakan kalkulasi yang lebih akurat
            const diffTime = targetDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            const dayInMonth = diffDays + 1; // +1 karena hari pertama adalah 1, bukan 0
            
            return {
                day: dayInMonth,
                month: parseInt(monthNum),
                year: 1447,
                monthName: monthData.name,
                monthNameAr: monthData.nameAr,
                isRamadan: parseInt(monthNum) === 9,
            };
        }
    }
    
    // Fallback untuk tahun 1446 H (sebelum 1447 H dimulai)
    const muharram1447 = new Date('2025-06-27T00:00:00');
    if (targetDate < muharram1447) {
        // Estimasi untuk 1446 H
        const zulhijah1446End = new Date('2025-06-26T00:00:00');
        const zulhijah1446Start = new Date('2025-05-28T00:00:00');
        
        if (targetDate >= zulhijah1446Start && targetDate <= zulhijah1446End) {
            const dayDiff = Math.floor((targetDate - zulhijah1446Start) / (1000 * 60 * 60 * 24)) + 1;
            return {
                day: dayDiff,
                month: 12,
                year: 1446,
                monthName: 'Zulhijah',
                monthNameAr: 'ذو الحجة',
                isRamadan: false,
            };
        }
    }
    
    // Fallback untuk tahun 1448 H (setelah 1447 H berakhir)
    const zulhijah1447End = new Date('2026-06-15T00:00:00');
    if (targetDate > zulhijah1447End) {
        const muharram1448Start = new Date('2026-06-16T00:00:00');
        const dayDiff = Math.floor((targetDate - muharram1448Start) / (1000 * 60 * 60 * 24)) + 1;
        
        const monthNum = Math.floor((dayDiff - 1) / 30) + 1;
        const dayInMonth = ((dayDiff - 1) % 30) + 1;
        
        const months = ['Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syakban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah'];
        const monthsAr = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
        
        return {
            day: dayInMonth,
            month: monthNum,
            year: 1448,
            monthName: months[monthNum - 1] || 'Muharram',
            monthNameAr: monthsAr[monthNum - 1] || 'محرم',
            isRamadan: monthNum === 9,
        };
    }
    
    // Default fallback
    return {
        day: 1,
        month: 1,
        year: 1447,
        monthName: 'Muharram',
        monthNameAr: 'محرم',
        isRamadan: false,
    };
}

// Format tanggal Hijriyah ke string
export function formatKHGTHijriDate(hijriDate) {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`;
}

// Format tanggal Hijriyah ke string Arab
export function formatKHGTHijriDateArabic(hijriDate) {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const dayAr = String(hijriDate.day).split('').map(d => arabicNumerals[parseInt(d)]).join('');
    const yearAr = String(hijriDate.year).split('').map(d => arabicNumerals[parseInt(d)]).join('');
    return `${dayAr} ${hijriDate.monthNameAr} ${yearAr} هـ`;
}

// Cek apakah sedang bulan Ramadan
export function isRamadan(date = new Date()) {
    const hijri = getKHGTHijriDate(date);
    return hijri.isRamadan;
}

// Hitung hari ke berapa Ramadan
export function getRamadanDay(date = new Date()) {
    const hijri = getKHGTHijriDate(date);
    if (hijri.isRamadan) {
        return hijri.day;
    }
    return null;
}

// Daftar hari besar Islam dengan perhitungan KHGT 1447 H
export function getIslamicEvents1447() {
    return [
        { name: 'Tahun Baru Hijriyah 1447 H', date: '2025-06-27', hijri: '1 Muharram 1447 H' },
        { name: 'Asyura', date: '2025-07-06', hijri: '10 Muharram 1447 H' },
        { name: 'Maulid Nabi Muhammad SAW', date: '2025-09-06', hijri: '12 Rabiul Awal 1447 H' },
        { name: 'Isra Mi\'raj', date: '2026-01-17', hijri: '27 Rajab 1447 H' },
        { name: 'Nisfu Sya\'ban', date: '2026-02-04', hijri: '15 Syakban 1447 H' },
        { name: 'Awal Ramadan 1447 H', date: '2026-02-18', hijri: '1 Ramadan 1447 H' },
        { name: 'Nuzulul Quran', date: '2026-03-07', hijri: '17 Ramadan 1447 H' },
        { name: 'Lailatul Qadr (malam 27)', date: '2026-03-16', hijri: '27 Ramadan 1447 H' },
        { name: 'Idul Fitri 1447 H', date: '2026-03-20', hijri: '1 Syawal 1447 H' },
        { name: 'Idul Adha 1447 H', date: '2026-05-27', hijri: '10 Zulhijah 1447 H' },
    ];
}

// Hitung countdown ke hari besar Islam terdekat
export function getNextIslamicEvent(date = new Date()) {
    const events = getIslamicEvents1447();
    const today = new Date(date.toISOString().split('T')[0] + 'T00:00:00');
    
    for (const event of events) {
        const eventDate = new Date(event.date + 'T00:00:00');
        const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
            return {
                ...event,
                daysUntil: diffDays,
            };
        }
    }
    
    return null;
}
