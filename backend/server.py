from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import aiofiles
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'masjid-khgt-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Jam Sholat Digital KHGT")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== MODELS ====================

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: str = "editor"  # admin or editor

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    name: str
    role: str = "editor"  # admin = full access, editor = content only
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MosqueIdentity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Masjid Muktamirin"
    address: str = "Kec. Galur, Kab. Kulon Progo, DI Yogyakarta"
    logo_url: Optional[str] = None
    latitude: float = -7.9404
    longitude: float = 110.2357
    elevation: int = 50
    timezone_offset: int = 7

class MosqueIdentityUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[int] = None
    timezone_offset: Optional[int] = None

class PrayerCalibration(BaseModel):
    """Kalibrasi waktu per sholat"""
    pre_adzan: int = 1  # Peringatan sebelum adzan (menit)
    jeda_adzan: int = 3  # Jeda adzan berlangsung (menit)
    pre_iqamah: int = 10  # Peringatan sebelum iqamah / waktu menunggu iqamah (menit)
    jeda_sholat: int = 10  # Durasi estimasi sholat (menit)

class PrayerSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Legacy iqomah (kept for compatibility)
    iqomah_subuh: int = 15
    iqomah_dzuhur: int = 10
    iqomah_ashar: int = 10
    iqomah_maghrib: int = 5
    iqomah_isya: int = 10
    bell_enabled: bool = True
    bell_before_minutes: int = 5
    # New calibration per prayer
    calibration_subuh: dict = Field(default_factory=lambda: {"pre_adzan": 1, "jeda_adzan": 3, "pre_iqamah": 15, "jeda_sholat": 10})
    calibration_dzuhur: dict = Field(default_factory=lambda: {"pre_adzan": 1, "jeda_adzan": 3, "pre_iqamah": 10, "jeda_sholat": 10})
    calibration_ashar: dict = Field(default_factory=lambda: {"pre_adzan": 1, "jeda_adzan": 3, "pre_iqamah": 10, "jeda_sholat": 10})
    calibration_maghrib: dict = Field(default_factory=lambda: {"pre_adzan": 1, "jeda_adzan": 3, "pre_iqamah": 5, "jeda_sholat": 10})
    calibration_isya: dict = Field(default_factory=lambda: {"pre_adzan": 1, "jeda_adzan": 3, "pre_iqamah": 10, "jeda_sholat": 10})
    # Notification sounds
    sound_pre_adzan: bool = True
    sound_adzan: bool = True
    sound_pre_iqamah: bool = True
    sound_iqamah: bool = True

class PrayerSettingsUpdate(BaseModel):
    iqomah_subuh: Optional[int] = None
    iqomah_dzuhur: Optional[int] = None
    iqomah_ashar: Optional[int] = None
    iqomah_maghrib: Optional[int] = None
    iqomah_isya: Optional[int] = None
    bell_enabled: Optional[bool] = None
    bell_before_minutes: Optional[int] = None
    calibration_subuh: Optional[dict] = None
    calibration_dzuhur: Optional[dict] = None
    calibration_ashar: Optional[dict] = None
    calibration_maghrib: Optional[dict] = None
    calibration_isya: Optional[dict] = None
    sound_pre_adzan: Optional[bool] = None
    sound_adzan: Optional[bool] = None
    sound_pre_iqamah: Optional[bool] = None
    sound_iqamah: Optional[bool] = None

class LayoutSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    theme: str = "modern"  # modern, classic, ramadhan
    primary_color: str = "#064E3B"
    secondary_color: str = "#D97706"
    background_image: Optional[str] = None
    background_images: List[str] = Field(default_factory=list)

class LayoutSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    background_image: Optional[str] = None
    background_images: Optional[List[str]] = None

class Content(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # poster, video, announcement
    title: str
    content_url: Optional[str] = None
    text: Optional[str] = None
    duration: int = 10  # seconds
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentCreate(BaseModel):
    type: str
    title: str
    content_url: Optional[str] = None
    text: Optional[str] = None
    duration: int = 10
    is_active: bool = True
    order: int = 0

class ContentUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    content_url: Optional[str] = None
    text: Optional[str] = None
    duration: Optional[int] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class Agenda(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    event_date: str  # ISO date string
    event_time: str  # HH:MM format
    location: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AgendaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: str
    location: Optional[str] = None
    is_active: bool = True

class AgendaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class RunningText(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    is_active: bool = True
    order: int = 0

class RunningTextCreate(BaseModel):
    text: str
    is_active: bool = True
    order: int = 0

class RunningTextUpdate(BaseModel):
    text: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

# ==================== ZIS (Zakat, Infaq, Shodaqoh) MODELS ====================

class ZISReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # zakat, infaq, shodaqoh
    amount: float
    description: Optional[str] = None
    date: str  # YYYY-MM-DD
    month: int  # 1-12
    year: int
    donor_name: Optional[str] = None  # Optional, bisa anonim
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ZISReportCreate(BaseModel):
    type: str
    amount: float
    description: Optional[str] = None
    date: str
    donor_name: Optional[str] = None

class ZISReportUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[str] = None
    donor_name: Optional[str] = None

# ==================== ANNOUNCEMENT MODELS ====================

class Announcement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str = "umum"  # umum, penting, kegiatan
    is_active: bool = True
    priority: int = 0  # Higher = more important
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "umum"
    is_active: bool = True
    priority: int = 0

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

# ==================== PENGURUS (Committee) MODELS ====================

class Pengurus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str  # Ketua, Wakil Ketua, Sekretaris, Bendahara, etc.
    period: str  # e.g., "2024-2027"
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PengurusCreate(BaseModel):
    name: str
    position: str
    period: str
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    order: int = 0
    is_active: bool = True

class PengurusUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    period: Optional[str] = None
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

# ==================== SPECIAL EVENT MODELS ====================

class SpecialEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    event_date: str  # YYYY-MM-DD
    event_time: Optional[str] = None  # HH:MM
    location: str = "Masjid Muktamirin"
    category: str = "kegiatan"  # nuzulul_quran, khatmil_quran, syawalan, isra_miraj, etc.
    imam: Optional[str] = None
    speaker: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SpecialEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    location: str = "Masjid Muktamirin"
    category: str = "kegiatan"
    imam: Optional[str] = None
    speaker: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

class SpecialEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    imam: Optional[str] = None
    speaker: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

# ==================== GALLERY MODELS ====================

class GalleryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_url: str
    description: Optional[str] = None
    event_date: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryItemCreate(BaseModel):
    title: str
    image_url: str
    description: Optional[str] = None
    event_date: Optional[str] = None
    order: int = 0
    is_active: bool = True

class GalleryItemUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

# ==================== ISLAMIC QUOTE MODELS ====================

class IslamicQuote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    arabic_text: Optional[str] = None
    translation: str
    source: str  # e.g., "HR. Bukhari", "QS. Al-Baqarah: 183"
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IslamicQuoteCreate(BaseModel):
    arabic_text: Optional[str] = None
    translation: str
    source: str
    is_active: bool = True
    order: int = 0

class IslamicQuoteUpdate(BaseModel):
    arabic_text: Optional[str] = None
    translation: Optional[str] = None
    source: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, username: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = hash_password(user.password)
    user_obj = User(username=user.username, name=user.name, role=user.role)
    doc = user_obj.model_dump()
    doc["password"] = hashed
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    token = create_token(user_obj.id, user_obj.username)
    return {"token": token, "user": {"id": user_obj.id, "username": user_obj.username, "name": user_obj.name, "role": user_obj.role}}

@api_router.post("/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"username": user.username}, {"_id": 0})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(db_user["id"], db_user["username"])
    return {"token": token, "user": {"id": db_user["id"], "username": db_user["username"], "name": db_user["name"]}}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "username": user["username"], "name": user["name"]}

# ==================== MOSQUE IDENTITY ====================

@api_router.get("/mosque/identity", response_model=MosqueIdentity)
async def get_mosque_identity():
    identity = await db.mosque_identity.find_one({}, {"_id": 0})
    if not identity:
        default = MosqueIdentity()
        doc = default.model_dump()
        await db.mosque_identity.insert_one(doc)
        return default
    return MosqueIdentity(**identity)

@api_router.put("/mosque/identity", response_model=MosqueIdentity)
async def update_mosque_identity(update: MosqueIdentityUpdate, user: dict = Depends(get_current_user)):
    identity = await db.mosque_identity.find_one({}, {"_id": 0})
    if not identity:
        default = MosqueIdentity()
        identity = default.model_dump()
        await db.mosque_identity.insert_one(identity)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.mosque_identity.update_one({}, {"$set": update_data})
    
    updated = await db.mosque_identity.find_one({}, {"_id": 0})
    return MosqueIdentity(**updated)

# ==================== PRAYER SETTINGS ====================

@api_router.get("/settings/prayer", response_model=PrayerSettings)
async def get_prayer_settings():
    settings = await db.prayer_settings.find_one({}, {"_id": 0})
    if not settings:
        default = PrayerSettings()
        await db.prayer_settings.insert_one(default.model_dump())
        return default
    return PrayerSettings(**settings)

@api_router.put("/settings/prayer", response_model=PrayerSettings)
async def update_prayer_settings(update: PrayerSettingsUpdate, user: dict = Depends(get_current_user)):
    settings = await db.prayer_settings.find_one({}, {"_id": 0})
    if not settings:
        default = PrayerSettings()
        settings = default.model_dump()
        await db.prayer_settings.insert_one(settings)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.prayer_settings.update_one({}, {"$set": update_data})
    
    updated = await db.prayer_settings.find_one({}, {"_id": 0})
    return PrayerSettings(**updated)

# ==================== LAYOUT SETTINGS ====================

@api_router.get("/settings/layout", response_model=LayoutSettings)
async def get_layout_settings():
    settings = await db.layout_settings.find_one({}, {"_id": 0})
    if not settings:
        default = LayoutSettings()
        await db.layout_settings.insert_one(default.model_dump())
        return default
    return LayoutSettings(**settings)

@api_router.put("/settings/layout", response_model=LayoutSettings)
async def update_layout_settings(update: LayoutSettingsUpdate, user: dict = Depends(get_current_user)):
    settings = await db.layout_settings.find_one({}, {"_id": 0})
    if not settings:
        default = LayoutSettings()
        settings = default.model_dump()
        await db.layout_settings.insert_one(settings)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.layout_settings.update_one({}, {"$set": update_data})
    
    updated = await db.layout_settings.find_one({}, {"_id": 0})
    return LayoutSettings(**updated)

# ==================== PRAYER TIMES (KHGT DATABASE) ====================

# Data jadwal sholat KHGT Yogyakarta Feb-Mar 2026 (dari hisabmu.com)
# Format: (subuh, terbit, dhuha, dzuhur, ashar, maghrib, isya)
KHGT_YOGYAKARTA_2026 = {
    # February 2026
    (2026, 2, 1): ("04:25", "05:39", "05:57", "11:53", "15:12", "18:06", "19:19"),
    (2026, 2, 2): ("04:26", "05:39", "05:57", "11:53", "15:12", "18:06", "19:19"),
    (2026, 2, 3): ("04:26", "05:39", "05:57", "11:53", "15:11", "18:06", "19:19"),
    (2026, 2, 4): ("04:27", "05:40", "05:58", "11:53", "15:11", "18:06", "19:19"),
    (2026, 2, 5): ("04:27", "05:40", "05:58", "11:53", "15:11", "18:06", "19:19"),
    (2026, 2, 6): ("04:28", "05:40", "05:58", "11:54", "15:10", "18:06", "19:18"),
    (2026, 2, 7): ("04:28", "05:40", "05:58", "11:54", "15:10", "18:06", "19:18"),
    (2026, 2, 8): ("04:28", "05:41", "05:59", "11:54", "15:09", "18:06", "19:18"),
    (2026, 2, 9): ("04:29", "05:41", "05:59", "11:54", "15:09", "18:05", "19:18"),
    (2026, 2, 10): ("04:29", "05:41", "05:59", "11:54", "15:09", "18:05", "19:17"),
    (2026, 2, 11): ("04:29", "05:41", "05:59", "11:54", "15:08", "18:05", "19:17"),
    (2026, 2, 12): ("04:30", "05:42", "06:00", "11:54", "15:07", "18:05", "19:17"),
    (2026, 2, 13): ("04:30", "05:42", "06:00", "11:54", "15:07", "18:05", "19:17"),
    (2026, 2, 14): ("04:30", "05:42", "06:00", "11:54", "15:06", "18:04", "19:16"),
    (2026, 2, 15): ("04:30", "05:42", "06:00", "11:54", "15:05", "18:04", "19:16"),
    (2026, 2, 16): ("04:31", "05:42", "06:00", "11:54", "15:05", "18:04", "19:15"),
    (2026, 2, 17): ("04:31", "05:42", "06:00", "11:54", "15:05", "18:04", "19:15"),
    (2026, 2, 18): ("04:31", "05:43", "06:01", "11:53", "15:03", "18:03", "19:14"),
    (2026, 2, 19): ("04:31", "05:43", "06:01", "11:53", "15:02", "18:03", "19:14"),
    (2026, 2, 20): ("04:32", "05:43", "06:01", "11:53", "15:02", "18:03", "19:14"),
    (2026, 2, 21): ("04:32", "05:43", "06:01", "11:53", "15:01", "18:02", "19:13"),
    (2026, 2, 22): ("04:32", "05:43", "06:01", "11:53", "15:01", "18:02", "19:13"),
    (2026, 2, 23): ("04:32", "05:43", "06:01", "11:53", "14:59", "18:02", "19:12"),
    (2026, 2, 24): ("04:33", "05:43", "06:01", "11:53", "14:58", "18:01", "19:12"),
    (2026, 2, 25): ("04:33", "05:43", "06:01", "11:53", "14:57", "18:01", "19:11"),
    (2026, 2, 26): ("04:33", "05:43", "06:01", "11:52", "14:56", "18:01", "19:11"),
    (2026, 2, 27): ("04:33", "05:43", "06:01", "11:52", "14:55", "18:00", "19:10"),
    (2026, 2, 28): ("04:33", "05:43", "06:01", "11:52", "14:54", "18:00", "19:10"),
    # March 2026
    (2026, 3, 1): ("04:33", "05:43", "06:01", "11:51", "14:52", "17:59", "19:09"),
    (2026, 3, 2): ("04:33", "05:43", "06:01", "11:51", "14:52", "17:58", "19:08"),
    (2026, 3, 3): ("04:33", "05:43", "06:01", "11:51", "14:51", "17:58", "19:08"),
    (2026, 3, 4): ("04:33", "05:43", "06:01", "11:51", "14:50", "17:57", "19:07"),
    (2026, 3, 5): ("04:33", "05:43", "06:01", "11:51", "14:50", "17:57", "19:07"),
    (2026, 3, 6): ("04:33", "05:43", "06:01", "11:50", "14:48", "17:56", "19:06"),
    (2026, 3, 7): ("04:33", "05:43", "06:01", "11:50", "14:47", "17:55", "19:05"),
    (2026, 3, 8): ("04:33", "05:42", "06:00", "11:50", "14:46", "17:55", "19:05"),
    (2026, 3, 9): ("04:33", "05:42", "06:00", "11:49", "14:45", "17:54", "19:04"),
    (2026, 3, 10): ("04:33", "05:42", "06:00", "11:49", "14:44", "17:53", "19:03"),
    (2026, 3, 11): ("04:33", "05:42", "06:00", "11:49", "14:43", "17:53", "19:03"),
    (2026, 3, 12): ("04:32", "05:41", "05:59", "11:48", "14:42", "17:52", "19:02"),
    (2026, 3, 13): ("04:32", "05:41", "05:59", "11:48", "14:41", "17:51", "19:01"),
    (2026, 3, 14): ("04:32", "05:41", "05:59", "11:47", "14:40", "17:51", "19:01"),
    (2026, 3, 15): ("04:32", "05:40", "05:58", "11:47", "14:39", "17:50", "19:00"),
    (2026, 3, 16): ("04:31", "05:40", "05:58", "11:47", "14:38", "17:49", "18:59"),
    (2026, 3, 17): ("04:31", "05:39", "05:57", "11:46", "14:37", "17:49", "18:58"),
    (2026, 3, 18): ("04:31", "05:39", "05:57", "11:46", "14:36", "17:48", "18:58"),
    (2026, 3, 19): ("04:30", "05:39", "05:57", "11:45", "14:35", "17:47", "18:57"),
    (2026, 3, 20): ("04:30", "05:38", "05:56", "11:45", "14:34", "17:47", "18:56"),
    (2026, 3, 21): ("04:30", "05:38", "05:56", "11:44", "14:32", "17:46", "18:55"),
    (2026, 3, 22): ("04:29", "05:37", "05:55", "11:44", "14:31", "17:45", "18:55"),
    (2026, 3, 23): ("04:29", "05:37", "05:55", "11:44", "14:30", "17:45", "18:54"),
    (2026, 3, 24): ("04:28", "05:36", "05:54", "11:43", "14:29", "17:44", "18:53"),
    (2026, 3, 25): ("04:28", "05:36", "05:54", "11:43", "14:28", "17:43", "18:52"),
    (2026, 3, 26): ("04:27", "05:35", "05:53", "11:42", "14:27", "17:43", "18:52"),
    (2026, 3, 27): ("04:27", "05:35", "05:53", "11:42", "14:26", "17:42", "18:51"),
    (2026, 3, 28): ("04:26", "05:34", "05:52", "11:41", "14:25", "17:41", "18:50"),
    (2026, 3, 29): ("04:26", "05:34", "05:52", "11:41", "14:24", "17:41", "18:50"),
    (2026, 3, 30): ("04:25", "05:33", "05:51", "11:40", "14:23", "17:40", "18:49"),
    (2026, 3, 31): ("04:25", "05:33", "05:51", "11:40", "14:22", "17:39", "18:48"),
}

def get_khgt_prayer_times(year: int, month: int, day: int):
    """Get prayer times from KHGT database"""
    key = (year, month, day)
    if key in KHGT_YOGYAKARTA_2026:
        times = KHGT_YOGYAKARTA_2026[key]
        # Calculate imsak (10 minutes before subuh)
        subuh_parts = times[0].split(":")
        imsak_hour = int(subuh_parts[0])
        imsak_min = int(subuh_parts[1]) - 10
        if imsak_min < 0:
            imsak_min += 60
            imsak_hour -= 1
        imsak = f"{imsak_hour:02d}:{imsak_min:02d}"
        
        return {
            "imsak": imsak,
            "subuh": times[0],
            "terbit": times[1],
            "dhuha": times[2],
            "dzuhur": times[3],
            "ashar": times[4],
            "maghrib": times[5],
            "isya": times[6],
        }
    return None

@api_router.get("/prayer-times")
async def get_prayer_times(date: Optional[str] = None):
    identity = await db.mosque_identity.find_one({}, {"_id": 0})
    if not identity:
        identity = MosqueIdentity().model_dump()
    
    tz = identity.get("timezone_offset", 7)
    
    # If date provided, use it. Otherwise use today (WIB)
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.now(timezone(timedelta(hours=tz)))
    
    year = target_date.year
    month = target_date.month
    day = target_date.day
    
    # Try to get from KHGT database first
    khgt_times = get_khgt_prayer_times(year, month, day)
    
    if khgt_times:
        return {
            "date": target_date.strftime("%Y-%m-%d"),
            **khgt_times
        }
    
    # Fallback to API if not in database
    lat = identity.get("latitude", -7.9404)
    lng = identity.get("longitude", 110.2357)
    elev = identity.get("elevation", 50)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://hisabmu.com/shalat/?latitude={lat}&longitude={lng}&elevation={elev}&timezone={tz}&dst=auto&method=MU&ikhtiyat=16"
            response = await client.get(url)
            html = response.text
            
            import re
            pattern = r'<tr[^>]*>\s*<td[^>]*>(\d+)[^<]*</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>'
            
            matches = re.findall(pattern, html, re.DOTALL)
            
            for match in matches:
                row_day = int(match[0].split('/')[0] if '/' in match[0] else match[0])
                if row_day == day:
                    subuh = match[1][:5]
                    # Calculate imsak
                    subuh_parts = subuh.split(":")
                    imsak_hour = int(subuh_parts[0])
                    imsak_min = int(subuh_parts[1]) - 10
                    if imsak_min < 0:
                        imsak_min += 60
                        imsak_hour -= 1
                    imsak = f"{imsak_hour:02d}:{imsak_min:02d}"
                    
                    return {
                        "date": target_date.strftime("%Y-%m-%d"),
                        "imsak": imsak,
                        "subuh": subuh,
                        "terbit": match[2][:5],
                        "dhuha": match[3][:5],
                        "dzuhur": match[4][:5],
                        "ashar": match[5][:5],
                        "maghrib": match[6][:5],
                        "isya": match[7][:5],
                    }
    except Exception as e:
        logging.error(f"Error fetching prayer times: {e}")
    
    # Final fallback
    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "imsak": "04:22",
        "subuh": "04:32",
        "terbit": "05:43",
        "dhuha": "06:01",
        "dzuhur": "11:53",
        "ashar": "15:02",
        "maghrib": "18:03",
        "isya": "19:14",
    }

@api_router.get("/prayer-times/monthly")
async def get_monthly_prayer_times(month: Optional[int] = None, year: Optional[int] = None):
    identity = await db.mosque_identity.find_one({}, {"_id": 0})
    if not identity:
        identity = MosqueIdentity().model_dump()
    
    lat = identity.get("latitude", -7.9404)
    lng = identity.get("longitude", 110.2357)
    elev = identity.get("elevation", 50)
    tz = identity.get("timezone_offset", 7)
    
    now = datetime.now(timezone(timedelta(hours=tz)))
    if not month:
        month = now.month
    if not year:
        year = now.year
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://hisabmu.com/shalat/?latitude={lat}&longitude={lng}&elevation={elev}&timezone={tz}&dst=auto&method=MU&ikhtiyat=16"
            response = await client.get(url)
            html = response.text
            
            import re
            pattern = r'<tr[^>]*>\s*<td[^>]*>(\d+)[^<]*</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>'
            
            matches = re.findall(pattern, html, re.DOTALL)
            
            schedule = []
            for match in matches:
                row_day = int(match[0].split('/')[0] if '/' in match[0] else match[0])
                schedule.append({
                    "day": row_day,
                    "subuh": match[1][:5],
                    "terbit": match[2][:5],
                    "dhuha": match[3][:5],
                    "dzuhur": match[4][:5],
                    "ashar": match[5][:5],
                    "maghrib": match[6][:5],
                    "isya": match[7][:5],
                })
            
            return {"month": month, "year": year, "schedule": schedule}
            
    except Exception as e:
        logging.error(f"Error fetching monthly prayer times: {e}")
        return {"month": month, "year": year, "schedule": [], "error": str(e)}

# ==================== CONTENT MANAGEMENT ====================

@api_router.get("/content", response_model=List[Content])
async def get_contents(active_only: bool = False):
    query = {"is_active": True} if active_only else {}
    contents = await db.contents.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return [Content(**c) for c in contents]

@api_router.post("/content", response_model=Content, status_code=201)
async def create_content(content: ContentCreate, user: dict = Depends(get_current_user)):
    content_obj = Content(**content.model_dump())
    doc = content_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contents.insert_one(doc)
    return content_obj

@api_router.put("/content/{content_id}", response_model=Content)
async def update_content(content_id: str, update: ContentUpdate, user: dict = Depends(get_current_user)):
    content = await db.contents.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.contents.update_one({"id": content_id}, {"$set": update_data})
    
    updated = await db.contents.find_one({"id": content_id}, {"_id": 0})
    return Content(**updated)

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str, user: dict = Depends(get_current_user)):
    result = await db.contents.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted"}

# ==================== AGENDA ====================

@api_router.get("/agenda", response_model=List[Agenda])
async def get_agendas(active_only: bool = False, upcoming_only: bool = False):
    query = {}
    if active_only:
        query["is_active"] = True
    
    agendas = await db.agendas.find(query, {"_id": 0}).sort("event_date", 1).to_list(100)
    
    if upcoming_only:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        agendas = [a for a in agendas if a.get("event_date", "") >= today]
    
    return [Agenda(**a) for a in agendas]

@api_router.post("/agenda", response_model=Agenda, status_code=201)
async def create_agenda(agenda: AgendaCreate, user: dict = Depends(get_current_user)):
    agenda_obj = Agenda(**agenda.model_dump())
    doc = agenda_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.agendas.insert_one(doc)
    return agenda_obj

@api_router.put("/agenda/{agenda_id}", response_model=Agenda)
async def update_agenda(agenda_id: str, update: AgendaUpdate, user: dict = Depends(get_current_user)):
    agenda = await db.agendas.find_one({"id": agenda_id}, {"_id": 0})
    if not agenda:
        raise HTTPException(status_code=404, detail="Agenda not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.agendas.update_one({"id": agenda_id}, {"$set": update_data})
    
    updated = await db.agendas.find_one({"id": agenda_id}, {"_id": 0})
    return Agenda(**updated)

@api_router.delete("/agenda/{agenda_id}")
async def delete_agenda(agenda_id: str, user: dict = Depends(get_current_user)):
    result = await db.agendas.delete_one({"id": agenda_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agenda not found")
    return {"message": "Agenda deleted"}

# ==================== RUNNING TEXT ====================

@api_router.get("/running-text", response_model=List[RunningText])
async def get_running_texts(active_only: bool = False):
    query = {"is_active": True} if active_only else {}
    texts = await db.running_texts.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return [RunningText(**t) for t in texts]

@api_router.post("/running-text", response_model=RunningText, status_code=201)
async def create_running_text(text: RunningTextCreate, user: dict = Depends(get_current_user)):
    text_obj = RunningText(**text.model_dump())
    await db.running_texts.insert_one(text_obj.model_dump())
    return text_obj

@api_router.put("/running-text/{text_id}", response_model=RunningText)
async def update_running_text(text_id: str, update: RunningTextUpdate, user: dict = Depends(get_current_user)):
    text = await db.running_texts.find_one({"id": text_id}, {"_id": 0})
    if not text:
        raise HTTPException(status_code=404, detail="Running text not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.running_texts.update_one({"id": text_id}, {"$set": update_data})
    
    updated = await db.running_texts.find_one({"id": text_id}, {"_id": 0})
    return RunningText(**updated)

@api_router.delete("/running-text/{text_id}")
async def delete_running_text(text_id: str, user: dict = Depends(get_current_user)):
    result = await db.running_texts.delete_one({"id": text_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Running text not found")
    return {"message": "Running text deleted"}

# ==================== FILE UPLOAD ====================

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}" if file_ext else file_id
    
    file_path = UPLOAD_DIR / filename
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Return base64 URL for simplicity (in production, use proper file serving)
    with open(file_path, 'rb') as f:
        b64_content = base64.b64encode(f.read()).decode()
    
    mime_type = file.content_type or "application/octet-stream"
    data_url = f"data:{mime_type};base64,{b64_content}"
    
    return {"url": data_url, "filename": filename}

# ==================== DASHBOARD STATS ====================

@api_router.get("/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    contents_count = await db.contents.count_documents({"is_active": True})
    agendas_count = await db.agendas.count_documents({"is_active": True})
    running_texts_count = await db.running_texts.count_documents({"is_active": True})
    
    return {
        "active_contents": contents_count,
        "active_agendas": agendas_count,
        "active_running_texts": running_texts_count,
    }

# ==================== RAMADAN SCHEDULE ====================

class RamadanDaySchedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD
    imam_subuh: Optional[str] = None
    penceramah_subuh: Optional[str] = None
    penceramah_berbuka: Optional[str] = None
    imam_tarawih: Optional[str] = None
    penyedia_takjil: Optional[str] = None
    penyedia_jaburan: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RamadanScheduleCreate(BaseModel):
    date: str
    imam_subuh: Optional[str] = None
    penceramah_subuh: Optional[str] = None
    penceramah_berbuka: Optional[str] = None
    imam_tarawih: Optional[str] = None
    penyedia_takjil: Optional[str] = None
    penyedia_jaburan: Optional[str] = None

@api_router.get("/ramadan/schedule", response_model=List[RamadanDaySchedule])
async def get_ramadan_schedule():
    """Get all Ramadan schedule data"""
    schedules = await db.ramadan_schedules.find({}, {"_id": 0}).sort("date", 1).to_list(100)
    return [RamadanDaySchedule(**s) for s in schedules]

@api_router.get("/ramadan/today")
async def get_ramadan_today():
    """Get today's Ramadan schedule"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    schedule = await db.ramadan_schedules.find_one({"date": today}, {"_id": 0})
    if not schedule:
        return None
    return RamadanDaySchedule(**schedule)

@api_router.post("/ramadan/schedule", response_model=RamadanDaySchedule)
async def save_ramadan_schedule(data: RamadanScheduleCreate, user: dict = Depends(get_current_user)):
    """Save or update Ramadan schedule for a specific date"""
    existing = await db.ramadan_schedules.find_one({"date": data.date})
    
    if existing:
        # Update existing
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        await db.ramadan_schedules.update_one({"date": data.date}, {"$set": update_data})
        updated = await db.ramadan_schedules.find_one({"date": data.date}, {"_id": 0})
        return RamadanDaySchedule(**updated)
    else:
        # Create new
        schedule_obj = RamadanDaySchedule(**data.model_dump())
        doc = schedule_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.ramadan_schedules.insert_one(doc)
        return schedule_obj

@api_router.delete("/ramadan/schedule/{date}")
async def delete_ramadan_schedule(date: str, user: dict = Depends(get_current_user)):
    """Delete Ramadan schedule for a specific date"""
    result = await db.ramadan_schedules.delete_one({"date": date})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted"}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Jam Sholat Digital KHGT API", "version": "1.0.0"}

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    """Health check endpoint for Docker/Kubernetes"""
    try:
        # Check MongoDB connection
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "service": "Jam Sholat Digital KHGT"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
