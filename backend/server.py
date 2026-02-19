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

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    name: str
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

class PrayerSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    iqomah_subuh: int = 15
    iqomah_dzuhur: int = 10
    iqomah_ashar: int = 10
    iqomah_maghrib: int = 5
    iqomah_isya: int = 10
    bell_enabled: bool = True
    bell_before_minutes: int = 5

class PrayerSettingsUpdate(BaseModel):
    iqomah_subuh: Optional[int] = None
    iqomah_dzuhur: Optional[int] = None
    iqomah_ashar: Optional[int] = None
    iqomah_maghrib: Optional[int] = None
    iqomah_isya: Optional[int] = None
    bell_enabled: Optional[bool] = None
    bell_before_minutes: Optional[int] = None

class LayoutSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    theme: str = "modern"  # modern, classic, ramadhan
    primary_color: str = "#064E3B"
    secondary_color: str = "#D97706"
    background_image: Optional[str] = None

class LayoutSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    background_image: Optional[str] = None

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
    user_obj = User(username=user.username, name=user.name)
    doc = user_obj.model_dump()
    doc["password"] = hashed
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    token = create_token(user_obj.id, user_obj.username)
    return {"token": token, "user": {"id": user_obj.id, "username": user_obj.username, "name": user_obj.name}}

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

# ==================== PRAYER TIMES (KHGT API) ====================

@api_router.get("/prayer-times")
async def get_prayer_times(date: Optional[str] = None):
    identity = await db.mosque_identity.find_one({}, {"_id": 0})
    if not identity:
        identity = MosqueIdentity().model_dump()
    
    lat = identity.get("latitude", -7.9404)
    lng = identity.get("longitude", 110.2357)
    elev = identity.get("elevation", 50)
    tz = identity.get("timezone_offset", 7)
    
    # If date provided, use it. Otherwise use today
    if date:
        target_date = datetime.fromisoformat(date)
    else:
        target_date = datetime.now(timezone(timedelta(hours=tz)))
    
    # Format for KHGT API (month and year)
    month = target_date.month
    year = target_date.year
    day = target_date.day
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://hisabmu.com/shalat/?latitude={lat}&longitude={lng}&elevation={elev}&timezone={tz}&dst=auto&method=MU&ikhtiyat=16"
            response = await client.get(url)
            
            # Parse the HTML response to extract prayer times
            html = response.text
            
            # Simple parsing - look for table data
            # The API returns HTML with a table, we need to extract the current day's times
            import re
            
            # Find the table rows
            pattern = r'<tr[^>]*>\s*<td[^>]*>(\d+)[^<]*</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>\s*<td[^>]*>(\d+:\d+:\d+)</td>'
            
            matches = re.findall(pattern, html, re.DOTALL)
            
            prayer_data = {}
            for match in matches:
                row_day = int(match[0].split('/')[0] if '/' in match[0] else match[0])
                if row_day == day:
                    prayer_data = {
                        "date": target_date.strftime("%Y-%m-%d"),
                        "hijri": "",  # Will be filled from another source if needed
                        "subuh": match[1][:5],
                        "terbit": match[2][:5],
                        "dhuha": match[3][:5],
                        "dzuhur": match[4][:5],
                        "ashar": match[5][:5],
                        "maghrib": match[6][:5],
                        "isya": match[7][:5],
                    }
                    break
            
            if not prayer_data:
                # Fallback with default times
                prayer_data = {
                    "date": target_date.strftime("%Y-%m-%d"),
                    "hijri": "",
                    "subuh": "04:30",
                    "terbit": "05:45",
                    "dhuha": "06:15",
                    "dzuhur": "11:55",
                    "ashar": "15:10",
                    "maghrib": "18:05",
                    "isya": "19:15",
                }
            
            return prayer_data
            
    except Exception as e:
        logging.error(f"Error fetching prayer times: {e}")
        # Return default prayer times on error
        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "hijri": "",
            "subuh": "04:30",
            "terbit": "05:45", 
            "dhuha": "06:15",
            "dzuhur": "11:55",
            "ashar": "15:10",
            "maghrib": "18:05",
            "isya": "19:15",
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

@api_router.post("/content", response_model=Content)
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

@api_router.post("/agenda", response_model=Agenda)
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

@api_router.post("/running-text", response_model=RunningText)
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

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Jam Sholat Digital KHGT API", "version": "1.0.0"}

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
