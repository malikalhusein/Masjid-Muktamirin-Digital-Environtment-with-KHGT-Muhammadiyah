"""
Test new features added in iteration 9:
1. README.md exists
2. AboutPage with tabs (Informasi, Donasi & Infaq, Kontak)
3. Mosque history text with Pangeran Diponegoro story
4. Highlight cards (1907, 1977, 24/7)
5. Gallery page at /homepage/gallery
6. Admin Identity page with description field
7. Admin Identity page with profile image upload
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewFeatures:
    """Test new features added for AboutPage, Gallery, and Admin Identity"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test with authentication"""
        # Login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        assert login_response.status_code == 200, "Login failed"
        self.token = login_response.json()["token"]
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
    
    def test_mosque_identity_has_description_field(self):
        """Test that mosque identity API returns description field"""
        response = requests.get(f"{BASE_URL}/api/mosque/identity")
        assert response.status_code == 200
        data = response.json()
        
        # Check that description field exists
        assert "description" in data, "description field missing from mosque identity"
        assert "profile_image_url" in data, "profile_image_url field missing from mosque identity"
        print(f"Description: {data.get('description')}")
        print(f"Profile image URL: {data.get('profile_image_url')}")
    
    def test_update_mosque_description(self):
        """Test updating mosque description via API"""
        test_description = "Test sejarah masjid yang berdiri sejak tahun 1907"
        
        # Update description
        response = requests.put(
            f"{BASE_URL}/api/mosque/identity",
            json={"description": test_description},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("description") == test_description
        
        # Verify description persisted
        get_response = requests.get(f"{BASE_URL}/api/mosque/identity")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data.get("description") == test_description
        print("SUCCESS: Description updated and persisted")
    
    def test_update_profile_image_url(self):
        """Test updating mosque profile image URL via API"""
        test_url = "https://example.com/test-mosque-image.jpg"
        
        # Update profile_image_url
        response = requests.put(
            f"{BASE_URL}/api/mosque/identity",
            json={"profile_image_url": test_url},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("profile_image_url") == test_url
        
        # Verify profile_image_url persisted
        get_response = requests.get(f"{BASE_URL}/api/mosque/identity")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data.get("profile_image_url") == test_url
        print("SUCCESS: Profile image URL updated and persisted")
    
    def test_gallery_api_endpoint(self):
        """Test gallery API is available"""
        response = requests.get(f"{BASE_URL}/api/gallery?active_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Gallery should return a list"
        print(f"Gallery items count: {len(data)}")
    
    def test_articles_api_for_informasi_tab(self):
        """Test articles API for Informasi tab content"""
        response = requests.get(f"{BASE_URL}/api/articles?published_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Articles should return a list"
        print(f"Articles count: {len(data)}")
    
    def test_announcements_api_for_informasi_tab(self):
        """Test announcements API for Informasi tab content"""
        response = requests.get(f"{BASE_URL}/api/announcements?active_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Announcements should return a list"
        print(f"Announcements count: {len(data)}")
    
    def test_pengurus_api_for_informasi_tab(self):
        """Test pengurus API for Informasi tab content"""
        response = requests.get(f"{BASE_URL}/api/pengurus?active_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Pengurus should return a list"
        print(f"Pengurus count: {len(data)}")
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("database") == "connected"
        print("SUCCESS: Backend healthy")


class TestReadmeFile:
    """Test README.md file exists"""
    
    def test_readme_exists(self):
        """Test that README.md file exists in /app directory"""
        readme_path = "/app/README.md"
        assert os.path.exists(readme_path), f"README.md not found at {readme_path}"
        
        # Verify README has content
        with open(readme_path, 'r') as f:
            content = f.read()
        
        assert len(content) > 100, "README.md should have substantial content"
        assert "Masjid Muktamirin" in content, "README should mention Masjid Muktamirin"
        assert "GitHub" in content or "Docker" in content, "README should have deployment info"
        print("SUCCESS: README.md exists with proper content")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
