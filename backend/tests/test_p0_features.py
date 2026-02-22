"""
Test P0 Features for Masjid Muktamirin Website
- Responsive Navigation (tested via frontend)
- Gallery Slider API
- Weekly Agenda API
- Logo/Mosque Identity API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Basic health check to ensure backend is running"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("SUCCESS: Health check passed")


class TestMosqueIdentity:
    """Test mosque identity API - used for logo display"""
    
    def test_get_mosque_identity(self):
        """Test GET mosque identity"""
        response = requests.get(f"{BASE_URL}/api/mosque/identity")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "name" in data
        assert "address" in data
        assert "logo_url" in data  # Can be null but field must exist
        assert "latitude" in data
        assert "longitude" in data
        
        print(f"SUCCESS: Mosque identity retrieved - Name: {data['name']}, Logo URL: {data['logo_url']}")


class TestGalleryAPI:
    """Test gallery API - used for Gallery Slider on homepage"""
    
    def test_get_gallery_list(self):
        """Test GET gallery items"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list (empty or with items)
        assert isinstance(data, list)
        print(f"SUCCESS: Gallery API returns {len(data)} items")
    
    def test_get_active_gallery(self):
        """Test GET active gallery items only"""
        response = requests.get(f"{BASE_URL}/api/gallery?active_only=true")
        assert response.status_code == 200
        data = response.json()
        
        # All items should be active
        for item in data:
            assert item.get("is_active") == True
        
        print(f"SUCCESS: Active gallery filter works - {len(data)} active items")


class TestAgendaAPI:
    """Test agenda API - used for Weekly Agenda on homepage"""
    
    def test_get_agenda_list(self):
        """Test GET agenda items"""
        response = requests.get(f"{BASE_URL}/api/agenda")
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list
        assert isinstance(data, list)
        print(f"SUCCESS: Agenda API returns {len(data)} items")
    
    def test_get_active_upcoming_agenda(self):
        """Test GET active and upcoming agenda items - used for Weekly Agenda"""
        response = requests.get(f"{BASE_URL}/api/agenda?active_only=true&upcoming_only=true")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"SUCCESS: Active upcoming agenda returns {len(data)} items")


class TestPrayerTimesAPI:
    """Test prayer times API - used in prayer times bar"""
    
    def test_get_prayer_times(self):
        """Test GET today's prayer times"""
        response = requests.get(f"{BASE_URL}/api/prayer-times")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required prayer times
        assert "subuh" in data
        assert "dzuhur" in data
        assert "ashar" in data
        assert "maghrib" in data
        assert "isya" in data
        
        print(f"SUCCESS: Prayer times retrieved - Subuh: {data['subuh']}, Maghrib: {data['maghrib']}")


class TestZISSummaryAPI:
    """Test ZIS summary API - used in homepage ZIS card"""
    
    def test_get_zis_summary(self):
        """Test GET ZIS summary"""
        response = requests.get(f"{BASE_URL}/api/zis/summary")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "zakat" in data
        assert "infaq" in data
        assert "shodaqoh" in data
        assert "grand_total" in data
        
        print(f"SUCCESS: ZIS summary retrieved - Total: {data['grand_total']}")


class TestQuotesAPI:
    """Test Islamic quotes API - used in homepage"""
    
    def test_get_random_quote(self):
        """Test GET random quote"""
        response = requests.get(f"{BASE_URL}/api/quotes/random")
        assert response.status_code == 200
        # Quote may be null if no quotes in DB
        print(f"SUCCESS: Random quote API works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
