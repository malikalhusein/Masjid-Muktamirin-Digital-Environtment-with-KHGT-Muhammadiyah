"""
P1 & P2 Features Test Suite:
- Ramadan schedule (30 days data)
- Islamic quotes (seeded quotes + random)
- Articles CRUD
- QRIS Settings GET/PUT
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRamadanSchedule:
    """Ramadan schedule endpoint tests - P1 feature"""
    
    def test_ramadan_schedule_returns_30_days(self):
        """Verify /api/ramadan/schedule returns 30 days of data"""
        response = requests.get(f"{BASE_URL}/api/ramadan/schedule")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 30, f"Expected 30 days, got {len(data)}"
        
        # Verify first entry structure
        first = data[0]
        assert "date" in first
        assert "ramadan_day" in first
        assert first["ramadan_day"] == 1
        assert first["date"] == "2025-03-01", "First day should be 2025-03-01"
        
        # Verify last entry
        last = data[-1]
        assert last["ramadan_day"] == 30
        assert last["date"] == "2025-03-30"
        
        # Verify data fields exist
        for entry in data:
            assert "imam_subuh" in entry
            assert "penceramah_subuh" in entry
            assert "materi" in entry
            assert "imam_tarawih" in entry
            assert "penyedia_takjil" in entry


class TestIslamicQuotes:
    """Islamic quotes endpoint tests - P1 feature"""
    
    def test_quotes_returns_seeded_data(self):
        """Verify /api/quotes returns at least 5 seeded quotes"""
        response = requests.get(f"{BASE_URL}/api/quotes")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 quotes, got {len(data)}"
        
        # Verify quote structure
        for quote in data:
            assert "translation" in quote
            assert "source" in quote
            assert "is_active" in quote
    
    def test_random_quote_returns_valid_quote(self):
        """Verify /api/quotes/random returns a valid quote"""
        response = requests.get(f"{BASE_URL}/api/quotes/random")
        assert response.status_code == 200
        
        quote = response.json()
        assert quote is not None, "Random quote should not be null"
        assert "translation" in quote
        assert "source" in quote
        
        # Check arabic_text if present
        if quote.get("arabic_text"):
            assert isinstance(quote["arabic_text"], str)


class TestArticles:
    """Articles CRUD endpoint tests - P1 feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for authenticated tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Return headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_articles_empty_or_list(self):
        """Verify /api/articles returns empty list or articles"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_article(self, auth_headers):
        """Verify article creation via POST"""
        article_data = {
            "title": "TEST_P1_Article",
            "content": "This is test article content for P1 testing",
            "category": "kegiatan",
            "is_published": True
        }
        response = requests.post(f"{BASE_URL}/api/articles", json=article_data, headers=auth_headers)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        
        data = response.json()
        assert data["title"] == "TEST_P1_Article"
        assert data["content"] == article_data["content"]
        assert data["category"] == "kegiatan"
        assert "id" in data
        
        # Store for cleanup
        self.__class__.created_article_id = data["id"]
    
    def test_get_article_by_id(self, auth_headers):
        """Verify article retrieval by ID"""
        if not hasattr(self.__class__, 'created_article_id'):
            pytest.skip("No article created")
        
        article_id = self.__class__.created_article_id
        response = requests.get(f"{BASE_URL}/api/articles/{article_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == article_id
        assert data["views"] >= 1, "View count should increment"
    
    def test_update_article(self, auth_headers):
        """Verify article update via PUT"""
        if not hasattr(self.__class__, 'created_article_id'):
            pytest.skip("No article created")
        
        article_id = self.__class__.created_article_id
        update_data = {"title": "TEST_P1_Article_Updated"}
        response = requests.put(f"{BASE_URL}/api/articles/{article_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "TEST_P1_Article_Updated"
    
    def test_delete_article(self, auth_headers):
        """Verify article deletion via DELETE"""
        if not hasattr(self.__class__, 'created_article_id'):
            pytest.skip("No article created")
        
        article_id = self.__class__.created_article_id
        response = requests.delete(f"{BASE_URL}/api/articles/{article_id}", headers=auth_headers)
        assert response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/articles/{article_id}")
        assert get_response.status_code == 404


class TestQRISSettings:
    """QRIS Settings endpoint tests - P2 feature"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_qris_settings(self):
        """Verify /api/qris-settings returns default or saved settings"""
        response = requests.get(f"{BASE_URL}/api/qris-settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "bank_name" in data
        assert "account_number" in data
        assert "account_name" in data
    
    def test_update_qris_settings(self, auth_headers):
        """Verify admin can update QRIS settings"""
        update_data = {
            "bank_name": "BSI (Bank Syariah Indonesia)",
            "account_number": "7148254552",
            "account_name": "Masjid Muktamirin",
            "qris_image_url": "https://example.com/test-qris.jpg"
        }
        response = requests.put(f"{BASE_URL}/api/qris-settings", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["bank_name"] == update_data["bank_name"]
        assert data["qris_image_url"] == update_data["qris_image_url"]
    
    def test_qris_settings_requires_admin(self):
        """Verify non-admin cannot update QRIS settings"""
        # Try with no auth
        response = requests.put(f"{BASE_URL}/api/qris-settings", json={"bank_name": "Test"})
        assert response.status_code in [401, 403]


class TestZISCharts:
    """ZIS chart data for Informasi page - P1 feature"""
    
    def test_zis_monthly_chart_returns_12_months(self):
        """Verify /api/zis/monthly-chart returns 12 months of data"""
        response = requests.get(f"{BASE_URL}/api/zis/monthly-chart", params={"year": 2026})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 12, f"Expected 12 months, got {len(data)}"
        
        # Verify structure
        for month_data in data:
            assert "month" in month_data
            assert "zakat" in month_data
            assert "infaq" in month_data
            assert "shodaqoh" in month_data
    
    def test_zis_summary_returns_totals(self):
        """Verify /api/zis/summary returns summary with totals"""
        response = requests.get(f"{BASE_URL}/api/zis/summary")
        assert response.status_code == 200
        
        data = response.json()
        assert "zakat" in data
        assert "infaq" in data
        assert "shodaqoh" in data
        assert "grand_total" in data


class TestNavigationLinks:
    """Test navigation tab Informasi exists"""
    
    def test_informasi_page_data_available(self):
        """Verify all data needed for Informasi page is available"""
        # Check ZIS summary
        response = requests.get(f"{BASE_URL}/api/zis/summary")
        assert response.status_code == 200
        
        # Check chart data
        response = requests.get(f"{BASE_URL}/api/zis/monthly-chart")
        assert response.status_code == 200
        
        # Check QRIS settings
        response = requests.get(f"{BASE_URL}/api/qris-settings")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
