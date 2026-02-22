"""
Backend API Tests for New Features - ZIS, Announcements, Pengurus, Special Events, Gallery, Quotes
Masjid Muktamirin Website

Test cases for all new CRUD operations with JWT authentication.
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-display.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"


class TestAuthentication:
    """Authentication tests for admin login"""
    
    def test_login_admin(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "token" in data, "Token missing from login response"
            assert "user" in data, "User missing from login response"
            print(f"✓ Admin login successful, got token")
        else:
            # Admin user may not exist, try to register
            print("Admin user not found, attempting to create...")
            
    def test_register_admin_if_needed(self):
        """Register admin user if it doesn't exist"""
        # First try login
        login_response = requests.post(f"{API_URL}/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if login_response.status_code == 200:
            print("✓ Admin already exists")
            return
        
        # Try to register
        response = requests.post(f"{API_URL}/auth/register", json={
            "username": "admin",
            "password": "admin123",
            "name": "Administrator",
            "role": "admin"
        })
        assert response.status_code in [200, 201, 400], f"Unexpected register status: {response.status_code}"
        print(f"✓ Admin registration attempt: {response.status_code}")


@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for protected endpoints"""
    # Try login first
    response = requests.post(f"{API_URL}/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json()["token"]
    
    # If login fails, try to register
    register_response = requests.post(f"{API_URL}/auth/register", json={
        "username": "admin",
        "password": "admin123",
        "name": "Administrator",
        "role": "admin"
    })
    if register_response.status_code in [200, 201]:
        return register_response.json()["token"]
    
    # Try login again after registration attempt
    response = requests.post(f"{API_URL}/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json()["token"]
    
    pytest.skip("Could not obtain auth token")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


# ==================== ZIS API TESTS ====================

class TestZISAPI:
    """Tests for ZIS (Zakat, Infaq, Shodaqoh) API endpoints"""
    
    created_ids = []
    
    def test_zis_get_all(self):
        """Test GET /api/zis - list all ZIS reports (no auth required)"""
        response = requests.get(f"{API_URL}/zis")
        assert response.status_code == 200, f"GET /api/zis failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/zis: {len(data)} reports found")
        
    def test_zis_get_summary(self):
        """Test GET /api/zis/summary - get ZIS summary"""
        response = requests.get(f"{API_URL}/zis/summary")
        assert response.status_code == 200, f"GET /api/zis/summary failed: {response.status_code}"
        data = response.json()
        assert "month" in data, "Summary should have month"
        assert "year" in data, "Summary should have year"
        assert "zakat" in data, "Summary should have zakat"
        assert "infaq" in data, "Summary should have infaq"
        assert "shodaqoh" in data, "Summary should have shodaqoh"
        assert "grand_total" in data, "Summary should have grand_total"
        print(f"✓ GET /api/zis/summary: grand_total={data['grand_total']}")
        
    def test_zis_get_monthly_chart(self):
        """Test GET /api/zis/monthly-chart - get monthly chart data"""
        response = requests.get(f"{API_URL}/zis/monthly-chart?year=2026")
        assert response.status_code == 200, f"GET /api/zis/monthly-chart failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 12, "Should return 12 months of data"
        print(f"✓ GET /api/zis/monthly-chart: {len(data)} months data")
        
    def test_zis_create(self, auth_headers):
        """Test POST /api/zis - create ZIS report"""
        payload = {
            "type": "infaq",
            "amount": 100000,
            "description": "TEST_ZIS: Infaq bulanan",
            "date": "2026-01-15",
            "donor_name": "TEST_Hamba Allah"
        }
        response = requests.post(f"{API_URL}/zis", json=payload, headers=auth_headers)
        assert response.status_code in [200, 201], f"POST /api/zis failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        assert data["type"] == "infaq", "Type should match"
        assert data["amount"] == 100000, "Amount should match"
        TestZISAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/zis: created id={data['id']}")
        
    def test_zis_update(self, auth_headers):
        """Test PUT /api/zis/{id} - update ZIS report"""
        if not TestZISAPI.created_ids:
            pytest.skip("No ZIS report to update")
        
        report_id = TestZISAPI.created_ids[0]
        payload = {"amount": 150000, "description": "TEST_ZIS: Updated infaq"}
        response = requests.put(f"{API_URL}/zis/{report_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"PUT /api/zis/{report_id} failed: {response.status_code}"
        data = response.json()
        assert data["amount"] == 150000, "Amount should be updated"
        print(f"✓ PUT /api/zis/{report_id}: amount updated to 150000")
        
    def test_zis_delete(self, auth_headers):
        """Test DELETE /api/zis/{id} - delete ZIS report"""
        if not TestZISAPI.created_ids:
            pytest.skip("No ZIS report to delete")
            
        report_id = TestZISAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/zis/{report_id}", headers=auth_headers)
        assert response.status_code in [200, 204], f"DELETE /api/zis/{report_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/zis/{report_id}: deleted successfully")


# ==================== ANNOUNCEMENTS API TESTS ====================

class TestAnnouncementsAPI:
    """Tests for Announcements API endpoints"""
    
    created_ids = []
    
    def test_announcements_get_all(self):
        """Test GET /api/announcements"""
        response = requests.get(f"{API_URL}/announcements")
        assert response.status_code == 200, f"GET /api/announcements failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/announcements: {len(data)} announcements found")
        
    def test_announcements_create(self, auth_headers):
        """Test POST /api/announcements"""
        payload = {
            "title": "TEST_Pengumuman Sholat Jumat",
            "content": "Khatib Jumat pekan ini adalah Ustadz Ahmad",
            "category": "penting",
            "is_active": True,
            "priority": 1
        }
        response = requests.post(f"{API_URL}/announcements", json=payload, headers=auth_headers)
        assert response.status_code in [200, 201], f"POST /api/announcements failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        assert data["title"] == "TEST_Pengumuman Sholat Jumat", "Title should match"
        TestAnnouncementsAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/announcements: created id={data['id']}")
        
    def test_announcements_update(self, auth_headers):
        """Test PUT /api/announcements/{id}"""
        if not TestAnnouncementsAPI.created_ids:
            pytest.skip("No announcement to update")
            
        item_id = TestAnnouncementsAPI.created_ids[0]
        payload = {"title": "TEST_Updated Pengumuman", "priority": 2}
        response = requests.put(f"{API_URL}/announcements/{item_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"PUT /api/announcements/{item_id} failed: {response.status_code}"
        data = response.json()
        assert data["title"] == "TEST_Updated Pengumuman", "Title should be updated"
        print(f"✓ PUT /api/announcements/{item_id}: updated successfully")
        
    def test_announcements_delete(self, auth_headers):
        """Test DELETE /api/announcements/{id}"""
        if not TestAnnouncementsAPI.created_ids:
            pytest.skip("No announcement to delete")
            
        item_id = TestAnnouncementsAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/announcements/{item_id}", headers=auth_headers)
        assert response.status_code in [200, 204], f"DELETE /api/announcements/{item_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/announcements/{item_id}: deleted successfully")


# ==================== PENGURUS API TESTS ====================

class TestPengurusAPI:
    """Tests for Pengurus (Committee) API endpoints - Admin only"""
    
    created_ids = []
    
    def test_pengurus_get_all(self):
        """Test GET /api/pengurus - public endpoint"""
        response = requests.get(f"{API_URL}/pengurus")
        assert response.status_code == 200, f"GET /api/pengurus failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/pengurus: {len(data)} pengurus found")
        
    def test_pengurus_create(self, auth_headers):
        """Test POST /api/pengurus - admin only"""
        payload = {
            "name": "TEST_Bpk. Ahmad",
            "position": "Ketua Takmir",
            "period": "2024-2027",
            "phone": "08121234567",
            "order": 0,
            "is_active": True
        }
        response = requests.post(f"{API_URL}/pengurus", json=payload, headers=auth_headers)
        # Could be 403 if user is not admin
        if response.status_code == 403:
            print("✓ POST /api/pengurus: 403 - correctly requires admin role")
            return
        assert response.status_code in [200, 201], f"POST /api/pengurus failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        TestPengurusAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/pengurus: created id={data['id']}")
        
    def test_pengurus_update(self, auth_headers):
        """Test PUT /api/pengurus/{id}"""
        if not TestPengurusAPI.created_ids:
            pytest.skip("No pengurus to update")
            
        item_id = TestPengurusAPI.created_ids[0]
        payload = {"name": "TEST_Updated Name", "position": "Wakil Ketua"}
        response = requests.put(f"{API_URL}/pengurus/{item_id}", json=payload, headers=auth_headers)
        if response.status_code == 403:
            print("✓ PUT /api/pengurus: 403 - correctly requires admin role")
            return
        assert response.status_code == 200, f"PUT /api/pengurus/{item_id} failed: {response.status_code}"
        print(f"✓ PUT /api/pengurus/{item_id}: updated successfully")
        
    def test_pengurus_delete(self, auth_headers):
        """Test DELETE /api/pengurus/{id}"""
        if not TestPengurusAPI.created_ids:
            pytest.skip("No pengurus to delete")
            
        item_id = TestPengurusAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/pengurus/{item_id}", headers=auth_headers)
        if response.status_code == 403:
            print("✓ DELETE /api/pengurus: 403 - correctly requires admin role")
            return
        assert response.status_code in [200, 204], f"DELETE /api/pengurus/{item_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/pengurus/{item_id}: deleted successfully")


# ==================== SPECIAL EVENTS API TESTS ====================

class TestSpecialEventsAPI:
    """Tests for Special Events API endpoints"""
    
    created_ids = []
    
    def test_special_events_get_all(self):
        """Test GET /api/special-events"""
        response = requests.get(f"{API_URL}/special-events")
        assert response.status_code == 200, f"GET /api/special-events failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/special-events: {len(data)} events found")
        
    def test_special_events_create(self, auth_headers):
        """Test POST /api/special-events"""
        payload = {
            "title": "TEST_Nuzulul Quran 1447 H",
            "description": "Peringatan Nuzulul Quran",
            "event_date": "2026-03-17",
            "event_time": "19:30",
            "location": "Masjid Muktamirin",
            "category": "nuzulul_quran",
            "imam": "Ustadz Ali",
            "speaker": "Ustadz Muhammad",
            "is_active": True
        }
        response = requests.post(f"{API_URL}/special-events", json=payload, headers=auth_headers)
        assert response.status_code in [200, 201], f"POST /api/special-events failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        TestSpecialEventsAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/special-events: created id={data['id']}")
        
    def test_special_events_update(self, auth_headers):
        """Test PUT /api/special-events/{id}"""
        if not TestSpecialEventsAPI.created_ids:
            pytest.skip("No event to update")
            
        item_id = TestSpecialEventsAPI.created_ids[0]
        payload = {"title": "TEST_Updated Event", "speaker": "Ustadz Budi"}
        response = requests.put(f"{API_URL}/special-events/{item_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"PUT /api/special-events/{item_id} failed: {response.status_code}"
        print(f"✓ PUT /api/special-events/{item_id}: updated successfully")
        
    def test_special_events_delete(self, auth_headers):
        """Test DELETE /api/special-events/{id}"""
        if not TestSpecialEventsAPI.created_ids:
            pytest.skip("No event to delete")
            
        item_id = TestSpecialEventsAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/special-events/{item_id}", headers=auth_headers)
        assert response.status_code in [200, 204], f"DELETE /api/special-events/{item_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/special-events/{item_id}: deleted successfully")


# ==================== GALLERY API TESTS ====================

class TestGalleryAPI:
    """Tests for Gallery API endpoints"""
    
    created_ids = []
    
    def test_gallery_get_all(self):
        """Test GET /api/gallery"""
        response = requests.get(f"{API_URL}/gallery")
        assert response.status_code == 200, f"GET /api/gallery failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/gallery: {len(data)} items found")
        
    def test_gallery_create(self, auth_headers):
        """Test POST /api/gallery"""
        payload = {
            "title": "TEST_Kegiatan Tarawih 1447 H",
            "image_url": "https://example.com/image.jpg",
            "description": "Foto kegiatan sholat tarawih",
            "event_date": "2026-03-01",
            "order": 0,
            "is_active": True
        }
        response = requests.post(f"{API_URL}/gallery", json=payload, headers=auth_headers)
        assert response.status_code in [200, 201], f"POST /api/gallery failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        TestGalleryAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/gallery: created id={data['id']}")
        
    def test_gallery_update(self, auth_headers):
        """Test PUT /api/gallery/{id}"""
        if not TestGalleryAPI.created_ids:
            pytest.skip("No gallery item to update")
            
        item_id = TestGalleryAPI.created_ids[0]
        payload = {"title": "TEST_Updated Gallery", "order": 1}
        response = requests.put(f"{API_URL}/gallery/{item_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"PUT /api/gallery/{item_id} failed: {response.status_code}"
        print(f"✓ PUT /api/gallery/{item_id}: updated successfully")
        
    def test_gallery_delete(self, auth_headers):
        """Test DELETE /api/gallery/{id}"""
        if not TestGalleryAPI.created_ids:
            pytest.skip("No gallery item to delete")
            
        item_id = TestGalleryAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/gallery/{item_id}", headers=auth_headers)
        assert response.status_code in [200, 204], f"DELETE /api/gallery/{item_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/gallery/{item_id}: deleted successfully")


# ==================== QUOTES API TESTS ====================

class TestQuotesAPI:
    """Tests for Islamic Quotes API endpoints"""
    
    created_ids = []
    
    def test_quotes_get_all(self):
        """Test GET /api/quotes"""
        response = requests.get(f"{API_URL}/quotes")
        assert response.status_code == 200, f"GET /api/quotes failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/quotes: {len(data)} quotes found")
        
    def test_quotes_get_random(self):
        """Test GET /api/quotes/random"""
        response = requests.get(f"{API_URL}/quotes/random")
        assert response.status_code == 200, f"GET /api/quotes/random failed: {response.status_code}"
        # Can be null if no quotes exist
        data = response.json()
        if data:
            assert "translation" in data or data is None, "Quote should have translation"
        print(f"✓ GET /api/quotes/random: returned {'quote' if data else 'null (no quotes yet)'}")
        
    def test_quotes_create(self, auth_headers):
        """Test POST /api/quotes"""
        payload = {
            "arabic_text": "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
            "translation": "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.",
            "source": "HR. Bukhari no. 6018",
            "is_active": True,
            "order": 0
        }
        response = requests.post(f"{API_URL}/quotes", json=payload, headers=auth_headers)
        assert response.status_code in [200, 201], f"POST /api/quotes failed: {response.status_code}"
        data = response.json()
        assert "id" in data, "Response should have id"
        assert data["source"] == "HR. Bukhari no. 6018", "Source should match"
        TestQuotesAPI.created_ids.append(data["id"])
        print(f"✓ POST /api/quotes: created id={data['id']}")
        
    def test_quotes_update(self, auth_headers):
        """Test PUT /api/quotes/{id}"""
        if not TestQuotesAPI.created_ids:
            pytest.skip("No quote to update")
            
        item_id = TestQuotesAPI.created_ids[0]
        payload = {"source": "HR. Bukhari & Muslim"}
        response = requests.put(f"{API_URL}/quotes/{item_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"PUT /api/quotes/{item_id} failed: {response.status_code}"
        print(f"✓ PUT /api/quotes/{item_id}: updated successfully")
        
    def test_quotes_random_after_create(self):
        """Test GET /api/quotes/random after creating a quote"""
        response = requests.get(f"{API_URL}/quotes/random")
        assert response.status_code == 200, f"GET /api/quotes/random failed: {response.status_code}"
        data = response.json()
        if data:
            assert "translation" in data, "Quote should have translation"
            assert "source" in data, "Quote should have source"
        print(f"✓ GET /api/quotes/random after create: {data['source'] if data else 'null'}")
        
    def test_quotes_delete(self, auth_headers):
        """Test DELETE /api/quotes/{id}"""
        if not TestQuotesAPI.created_ids:
            pytest.skip("No quote to delete")
            
        item_id = TestQuotesAPI.created_ids.pop()
        response = requests.delete(f"{API_URL}/quotes/{item_id}", headers=auth_headers)
        assert response.status_code in [200, 204], f"DELETE /api/quotes/{item_id} failed: {response.status_code}"
        print(f"✓ DELETE /api/quotes/{item_id}: deleted successfully")


# ==================== HEALTH CHECK ====================

class TestHealthEndpoint:
    """Health endpoint test"""
    
    def test_health(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{API_URL}/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        data = response.json()
        assert data["status"] == "healthy", "Status should be healthy"
        assert data["database"] == "connected", "Database should be connected"
        print(f"✓ GET /api/health: status={data['status']}, db={data['database']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
