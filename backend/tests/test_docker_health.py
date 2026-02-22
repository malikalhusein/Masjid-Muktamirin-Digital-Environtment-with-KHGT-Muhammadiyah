"""
Backend API tests for Jam Sholat Digital KHGT
Tests for: Health endpoint, Docker files validation, Core APIs
"""
import pytest
import requests
import os

# Get base URL from environment - no default to fail fast
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://islamic-cms.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health endpoint tests for Docker/Kubernetes"""
    
    def test_health_endpoint_returns_200(self):
        """Test /api/health returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_health_endpoint_returns_healthy_status(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("status") == "healthy", f"Expected 'healthy', got {data.get('status')}"
        assert "database" in data, "Response should contain 'database' field"
        assert "service" in data, "Response should contain 'service' field"
    
    def test_health_endpoint_database_connected(self):
        """Test /api/health shows database connected"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("database") == "connected", f"Expected 'connected', got {data.get('database')}"


class TestDockerFilesExist:
    """Verify Docker configuration files exist and are properly configured"""
    
    def test_backend_dockerfile_exists(self):
        """Test backend Dockerfile exists"""
        dockerfile_path = "/app/backend/Dockerfile"
        assert os.path.exists(dockerfile_path), f"Backend Dockerfile not found at {dockerfile_path}"
        
        with open(dockerfile_path, 'r') as f:
            content = f.read()
        
        # Check for essential Dockerfile commands
        assert 'FROM python' in content, "Dockerfile should use Python base image"
        assert 'WORKDIR' in content, "Dockerfile should set WORKDIR"
        assert 'requirements.txt' in content, "Dockerfile should copy requirements.txt"
        assert 'EXPOSE' in content, "Dockerfile should EXPOSE port"
        assert 'uvicorn' in content.lower(), "Dockerfile should run uvicorn"
    
    def test_frontend_dockerfile_exists(self):
        """Test frontend Dockerfile exists"""
        dockerfile_path = "/app/frontend/Dockerfile"
        assert os.path.exists(dockerfile_path), f"Frontend Dockerfile not found at {dockerfile_path}"
        
        with open(dockerfile_path, 'r') as f:
            content = f.read()
        
        # Check for essential Dockerfile commands
        assert 'FROM node' in content, "Dockerfile should use Node base image"
        assert 'nginx' in content.lower(), "Dockerfile should include nginx for production"
        assert 'REACT_APP_BACKEND_URL' in content, "Dockerfile should handle REACT_APP_BACKEND_URL"
    
    def test_docker_compose_exists(self):
        """Test docker-compose.yml exists"""
        compose_path = "/app/docker-compose.yml"
        assert os.path.exists(compose_path), f"docker-compose.yml not found at {compose_path}"
        
        with open(compose_path, 'r') as f:
            content = f.read()
        
        # Check for essential services
        assert 'mongodb' in content, "docker-compose should define mongodb service"
        assert 'backend' in content, "docker-compose should define backend service"
        assert 'frontend' in content, "docker-compose should define frontend service"
        assert 'healthcheck' in content, "docker-compose should include healthchecks"
    
    def test_nginx_conf_exists(self):
        """Test nginx.conf exists"""
        nginx_path = "/app/frontend/nginx.conf"
        assert os.path.exists(nginx_path), f"nginx.conf not found at {nginx_path}"
        
        with open(nginx_path, 'r') as f:
            content = f.read()
        
        # Check for essential nginx config
        assert 'server' in content, "nginx.conf should define server block"
        assert 'listen 80' in content, "nginx.conf should listen on port 80"
        assert 'try_files' in content, "nginx.conf should have try_files for React Router"
        assert 'index.html' in content, "nginx.conf should fallback to index.html"


class TestCoreAPIs:
    """Test core API endpoints"""
    
    def test_root_api_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "version" in data
    
    def test_prayer_times_endpoint(self):
        """Test /api/prayer-times returns prayer times"""
        response = requests.get(f"{BASE_URL}/api/prayer-times")
        assert response.status_code == 200
        data = response.json()
        
        # Check for required prayer time fields
        required_fields = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']
        for field in required_fields:
            assert field in data, f"Prayer times should include {field}"
    
    def test_mosque_identity_endpoint(self):
        """Test /api/mosque/identity returns mosque info"""
        response = requests.get(f"{BASE_URL}/api/mosque/identity")
        assert response.status_code == 200
        data = response.json()
        
        # Check for required identity fields
        assert "name" in data, "Mosque identity should include name"
        assert "address" in data, "Mosque identity should include address"
    
    def test_agenda_endpoint(self):
        """Test /api/agenda returns agenda list"""
        response = requests.get(f"{BASE_URL}/api/agenda")
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list (even if empty)
        assert isinstance(data, list), "Agenda endpoint should return a list"
    
    def test_ramadan_schedule_endpoint(self):
        """Test /api/ramadan/schedule returns Ramadan schedule"""
        response = requests.get(f"{BASE_URL}/api/ramadan/schedule")
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list (even if empty)
        assert isinstance(data, list), "Ramadan schedule endpoint should return a list"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
