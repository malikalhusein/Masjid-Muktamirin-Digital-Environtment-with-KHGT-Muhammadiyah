"""
Backend API tests for Jam Sholat Digital KHGT
Tests: Authentication, Prayer Times, Calibration Settings, Sound Notifications
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-display.preview.emergentagent.com').rstrip('/')


class TestAPIRoot:
    """Test API root endpoint"""
    
    def test_api_root(self):
        """Test API root returns correct response"""
        response = requests.get(f"{BASE_URL}/api/", timeout=30)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Jam Sholat Digital KHGT API"
        assert data["version"] == "1.0.0"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["username"] == "admin"
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        }, timeout=30)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_get_me_with_valid_token(self):
        """Test getting current user with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        token = login_response.json()["token"]
        
        # Get user info with token
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        }, timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert data["username"] == "admin"
    
    def test_get_me_without_token(self):
        """Test getting current user without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me", timeout=30)
        assert response.status_code in [401, 403]


class TestPrayerTimes:
    """Prayer times API tests - KHGT specific"""
    
    def test_get_prayer_times_today(self):
        """Test getting today's prayer times from KHGT database"""
        response = requests.get(f"{BASE_URL}/api/prayer-times", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required prayer times are present
        required_fields = ["date", "subuh", "dzuhur", "ashar", "maghrib", "isya", "terbit"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify time format (HH:MM)
        time_fields = ["subuh", "dzuhur", "ashar", "maghrib", "isya", "terbit"]
        for field in time_fields:
            time_value = data[field]
            assert ":" in time_value, f"Invalid time format for {field}: {time_value}"
    
    def test_get_prayer_times_with_date(self):
        """Test getting prayer times for specific date"""
        # Test with a date in the KHGT database (Feb 2026)
        test_date = "2026-02-15"
        response = requests.get(f"{BASE_URL}/api/prayer-times?date={test_date}", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert data["date"] == test_date
        assert "subuh" in data
    
    def test_monthly_prayer_times(self):
        """Test getting monthly prayer times"""
        response = requests.get(f"{BASE_URL}/api/prayer-times/monthly", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert "month" in data
        assert "year" in data
        assert "schedule" in data


class TestPrayerSettings:
    """Prayer settings and calibration API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        return response.json()["token"]
    
    def test_get_prayer_settings(self):
        """Test getting prayer settings (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/settings/prayer", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify legacy iqomah settings
        assert "iqomah_subuh" in data
        assert "iqomah_dzuhur" in data
        assert "iqomah_ashar" in data
        assert "iqomah_maghrib" in data
        assert "iqomah_isya" in data
        
        # Verify new calibration settings
        assert "calibration_subuh" in data
        assert "calibration_dzuhur" in data
        assert "calibration_ashar" in data
        assert "calibration_maghrib" in data
        assert "calibration_isya" in data
        
        # Verify calibration structure
        for prayer in ["subuh", "dzuhur", "ashar", "maghrib", "isya"]:
            cal = data[f"calibration_{prayer}"]
            assert "pre_adzan" in cal
            assert "jeda_adzan" in cal
            assert "pre_iqamah" in cal
            assert "jeda_sholat" in cal
        
        # Verify sound notification settings
        assert "sound_pre_adzan" in data
        assert "sound_adzan" in data
        assert "sound_pre_iqamah" in data
        assert "sound_iqamah" in data
    
    def test_update_prayer_settings_with_calibration(self, auth_token):
        """Test updating prayer settings with calibration data"""
        update_data = {
            "iqomah_subuh": 18,
            "calibration_subuh": {
                "pre_adzan": 2,
                "jeda_adzan": 4,
                "pre_iqamah": 18,
                "jeda_sholat": 12
            },
            "sound_pre_adzan": True
        }
        
        response = requests.put(f"{BASE_URL}/api/settings/prayer", 
            json=update_data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify update was applied
        assert data["iqomah_subuh"] == 18
        assert data["calibration_subuh"]["pre_adzan"] == 2
        assert data["sound_pre_adzan"] == True
    
    def test_update_sound_notifications(self, auth_token):
        """Test updating sound notification settings"""
        update_data = {
            "sound_pre_adzan": True,
            "sound_adzan": True,
            "sound_pre_iqamah": False,
            "sound_iqamah": True
        }
        
        response = requests.put(f"{BASE_URL}/api/settings/prayer",
            json=update_data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["sound_pre_adzan"] == True
        assert data["sound_adzan"] == True
        assert data["sound_pre_iqamah"] == False
        assert data["sound_iqamah"] == True
    
    def test_update_prayer_settings_unauthorized(self):
        """Test updating prayer settings without auth"""
        response = requests.put(f"{BASE_URL}/api/settings/prayer",
            json={"iqomah_subuh": 20},
            timeout=30
        )
        
        assert response.status_code in [401, 403]


class TestLayoutSettings:
    """Layout settings API tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        return response.json()["token"]
    
    def test_get_layout_settings(self):
        """Test getting layout settings (public)"""
        response = requests.get(f"{BASE_URL}/api/settings/layout", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert "theme" in data
        assert "primary_color" in data
    
    def test_update_layout_settings(self, auth_token):
        """Test updating layout settings"""
        response = requests.put(f"{BASE_URL}/api/settings/layout",
            json={"theme": "classic"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["theme"] == "classic"


class TestMosqueIdentity:
    """Mosque identity API tests"""
    
    def test_get_mosque_identity(self):
        """Test getting mosque identity (public)"""
        response = requests.get(f"{BASE_URL}/api/mosque/identity", timeout=30)
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "address" in data
        assert "latitude" in data
        assert "longitude" in data


class TestContentCRUD:
    """Content CRUD operations tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        return response.json()["token"]
    
    def test_content_crud_cycle(self, auth_token):
        """Test full CRUD cycle for content"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # CREATE
        create_response = requests.post(f"{BASE_URL}/api/content",
            json={
                "type": "announcement",
                "title": "TEST_Announcement",
                "text": "Test content text",
                "duration": 5,
                "is_active": True,
                "order": 99
            },
            headers=headers,
            timeout=30
        )
        assert create_response.status_code == 201
        content_id = create_response.json()["id"]
        
        # READ
        get_response = requests.get(f"{BASE_URL}/api/content", timeout=30)
        assert get_response.status_code == 200
        contents = get_response.json()
        assert any(c["id"] == content_id for c in contents)
        
        # UPDATE
        update_response = requests.put(f"{BASE_URL}/api/content/{content_id}",
            json={"title": "TEST_Updated Announcement"},
            headers=headers,
            timeout=30
        )
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "TEST_Updated Announcement"
        
        # DELETE
        delete_response = requests.delete(f"{BASE_URL}/api/content/{content_id}",
            headers=headers,
            timeout=30
        )
        assert delete_response.status_code == 200


class TestDashboardStats:
    """Dashboard stats API tests"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        }, timeout=30)
        return response.json()["token"]
    
    def test_get_dashboard_stats(self, auth_token):
        """Test getting dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/stats",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "active_contents" in data
        assert "active_agendas" in data
        assert "active_running_texts" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
