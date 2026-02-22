"""
Script to seed Ramadan 1446 H schedule data from PDF extraction
Run this script to populate the database with 30 days of Ramadan schedule
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "masjid_db")

# Ramadan 1446 H Data (extracted from PDF)
# Format: date, ramadan_day, imam_subuh, penceramah_subuh (kultum), materi, imam_tarawih, penyedia_takjil, penyedia_jaburan
RAMADAN_DATA = [
    # Hari 1-10
    {"date": "2025-03-01", "ramadan_day": 1, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Menyambut Ramadan", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-02", "ramadan_day": 2, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Keutamaan Puasa", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-03", "ramadan_day": 3, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Adab Berpuasa", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-04", "ramadan_day": 4, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Tadarus Al-Quran", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-05", "ramadan_day": 5, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Sholat Tarawih", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-06", "ramadan_day": 6, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Sedekah di Ramadan", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-07", "ramadan_day": 7, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Doa-doa Ramadan", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-08", "ramadan_day": 8, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Itikaf", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-09", "ramadan_day": 9, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Zakat Fitrah", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-10", "ramadan_day": 10, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Lailatul Qadar", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Remaja Masjid"},
    # Hari 11-20
    {"date": "2025-03-11", "ramadan_day": 11, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Berbakti Orang Tua", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-12", "ramadan_day": 12, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Silaturahmi", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-13", "ramadan_day": 13, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Akhlak Mulia", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-14", "ramadan_day": 14, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Sabar dan Syukur", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-15", "ramadan_day": 15, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Taubat Nasuha", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-16", "ramadan_day": 16, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Istiqomah", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-17", "ramadan_day": 17, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Nuzulul Quran", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-18", "ramadan_day": 18, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Menghidupkan Malam", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-19", "ramadan_day": 19, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Menjaga Lisan", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-20", "ramadan_day": 20, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "10 Malam Terakhir", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Karang Taruna"},
    # Hari 21-30
    {"date": "2025-03-21", "ramadan_day": 21, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Malam Ganjil", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-22", "ramadan_day": 22, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Doa Lailatul Qadar", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-23", "ramadan_day": 23, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Keutamaan Malam 23", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-24", "ramadan_day": 24, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Persiapan Idul Fitri", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-25", "ramadan_day": 25, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Keutamaan Malam 25", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-26", "ramadan_day": 26, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Zakat Fitrah", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 01", "penyedia_jaburan": "Remaja Masjid"},
    {"date": "2025-03-27", "ramadan_day": 27, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Keutamaan Malam 27", "imam_tarawih": "Ust. Yusuf", "penyedia_takjil": "RT 02", "penyedia_jaburan": "Ibu-ibu PKK"},
    {"date": "2025-03-28", "ramadan_day": 28, "imam_subuh": "Ust. Ahmad", "penceramah_subuh": "Ust. Yusuf", "materi": "Pamitan Ramadan", "imam_tarawih": "Ust. Ahmad", "penyedia_takjil": "RT 03", "penyedia_jaburan": "Karang Taruna"},
    {"date": "2025-03-29", "ramadan_day": 29, "imam_subuh": "Ust. Hasan", "penceramah_subuh": "Ust. Ahmad", "materi": "Takbiran", "imam_tarawih": "Ust. Hasan", "penyedia_takjil": "RT 04", "penyedia_jaburan": "Ibu-ibu Pengajian"},
    {"date": "2025-03-30", "ramadan_day": 30, "imam_subuh": "Ust. Yusuf", "penceramah_subuh": "Ust. Hasan", "materi": "Idul Fitri", "imam_tarawih": "-", "penyedia_takjil": "RT 05", "penyedia_jaburan": "Semua Warga"},
]

async def seed_ramadan_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing Ramadan data
    await db.ramadan_schedules.delete_many({})
    
    # Insert new data
    for item in RAMADAN_DATA:
        doc = {
            "id": str(uuid.uuid4()),
            "date": item["date"],
            "ramadan_day": item["ramadan_day"],
            "imam_subuh": item["imam_subuh"],
            "penceramah_subuh": item["penceramah_subuh"],
            "materi": item["materi"],
            "penceramah_berbuka": None,
            "imam_tarawih": item["imam_tarawih"],
            "penyedia_takjil": item["penyedia_takjil"],
            "penyedia_jaburan": item["penyedia_jaburan"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.ramadan_schedules.insert_one(doc)
    
    print(f"✅ Seeded {len(RAMADAN_DATA)} Ramadan schedule entries")
    client.close()

# Also seed some sample data for other collections
SAMPLE_QUOTES = [
    {
        "arabic_text": "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        "translation": "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.",
        "source": "HR. Bukhari & Muslim"
    },
    {
        "arabic_text": "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        "translation": "Sebaik-baik kalian adalah orang yang mempelajari Al-Quran dan mengajarkannya.",
        "source": "HR. Bukhari"
    },
    {
        "arabic_text": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
        "translation": "Sesungguhnya setiap amal perbuatan bergantung pada niatnya.",
        "source": "HR. Bukhari & Muslim"
    },
    {
        "arabic_text": "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
        "translation": "Dunia adalah penjara bagi mukmin dan surga bagi orang kafir.",
        "source": "HR. Muslim"
    },
    {
        "arabic_text": "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
        "translation": "Muslim adalah orang yang kaum muslimin selamat dari lisan dan tangannya.",
        "source": "HR. Bukhari & Muslim"
    }
]

SAMPLE_ANNOUNCEMENTS = [
    {
        "title": "Jadwal Imam Sholat Jumat",
        "content": "Khatib Jumat pekan ini adalah Ustadz Ahmad. Jamaah diharapkan hadir 15 menit sebelum khutbah dimulai.",
        "category": "umum",
        "priority": 1
    },
    {
        "title": "Pengajian Rutin Ahad Pagi",
        "content": "Pengajian rutin setiap hari Ahad pukul 06.00 WIB setelah sholat Subuh. Tema bulan ini: Fiqih Ibadah.",
        "category": "kegiatan",
        "priority": 0
    },
    {
        "title": "Donasi Pembangunan Masjid",
        "content": "Program donasi untuk renovasi lantai 2 masjid masih dibuka. Salurkan melalui QRIS atau rekening BSI 7148254552.",
        "category": "penting",
        "priority": 2
    }
]

async def seed_sample_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Seed Quotes if empty
    quotes_count = await db.quotes.count_documents({})
    if quotes_count == 0:
        for quote in SAMPLE_QUOTES:
            doc = {
                "id": str(uuid.uuid4()),
                "arabic_text": quote["arabic_text"],
                "translation": quote["translation"],
                "source": quote["source"],
                "is_active": True,
                "order": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.quotes.insert_one(doc)
        print(f"✅ Seeded {len(SAMPLE_QUOTES)} Islamic quotes")
    
    # Seed Announcements if empty
    announcements_count = await db.announcements.count_documents({})
    if announcements_count == 0:
        for ann in SAMPLE_ANNOUNCEMENTS:
            doc = {
                "id": str(uuid.uuid4()),
                "title": ann["title"],
                "content": ann["content"],
                "category": ann["category"],
                "is_active": True,
                "priority": ann["priority"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.announcements.insert_one(doc)
        print(f"✅ Seeded {len(SAMPLE_ANNOUNCEMENTS)} announcements")
    
    client.close()

async def main():
    await seed_ramadan_data()
    await seed_sample_data()
    print("🎉 Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(main())
