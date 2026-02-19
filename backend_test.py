import requests
import sys
import json
from datetime import datetime

class KHGTAPITester:
    def __init__(self, base_url="https://khgt-display-system.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.created_ids = {
            'content': [],
            'agenda': [],
            'running_text': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token and auth_required:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse response
                try:
                    resp_data = response.json()
                    if isinstance(resp_data, dict) and 'id' in resp_data:
                        print(f"   Created/Retrieved ID: {resp_data['id']}")
                    return success, resp_data
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Network/Timeout Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200, auth_required=False)

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_username = f"testadmin_{timestamp}"
        test_data = {
            "username": test_username,
            "password": "testpass123",
            "name": "Test Admin User"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200, 
            data=test_data, 
            auth_required=False
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   🔑 Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login_user(self):
        """Test user login with existing credentials"""
        # Try with a known user if registration fails
        test_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "User Login (fallback)", 
            "POST", 
            "auth/login", 
            200, 
            data=test_data, 
            auth_required=False
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   🔑 Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_me(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_mosque_identity(self):
        """Test mosque identity endpoints"""
        # Get identity
        success, identity = self.run_test("Get Mosque Identity", "GET", "mosque/identity", 200, auth_required=False)
        
        if success:
            # Update identity
            update_data = {
                "name": "Test Masjid Updated",
                "address": "Test Address Updated"
            }
            return self.run_test("Update Mosque Identity", "PUT", "mosque/identity", 200, data=update_data)
        return False

    def test_prayer_settings(self):
        """Test prayer settings endpoints"""
        # Get settings
        success, settings = self.run_test("Get Prayer Settings", "GET", "settings/prayer", 200, auth_required=False)
        
        if success:
            # Update settings
            update_data = {
                "iqomah_subuh": 20,
                "bell_enabled": True
            }
            return self.run_test("Update Prayer Settings", "PUT", "settings/prayer", 200, data=update_data)
        return False

    def test_layout_settings(self):
        """Test layout settings endpoints"""
        # Get settings
        success, settings = self.run_test("Get Layout Settings", "GET", "settings/layout", 200, auth_required=False)
        
        if success:
            # Update settings
            update_data = {
                "theme": "modern",
                "primary_color": "#064E3B"
            }
            return self.run_test("Update Layout Settings", "PUT", "settings/layout", 200, data=update_data)
        return False

    def test_prayer_times(self):
        """Test prayer times API"""
        # Get today's prayer times
        success1, _ = self.run_test("Get Prayer Times", "GET", "prayer-times", 200, auth_required=False)
        
        # Get monthly prayer times
        success2, _ = self.run_test("Get Monthly Prayer Times", "GET", "prayer-times/monthly", 200, auth_required=False)
        
        return success1 and success2

    def test_content_crud(self):
        """Test content CRUD operations"""
        # Create content
        content_data = {
            "type": "announcement",
            "title": "Test Announcement",
            "text": "This is a test announcement",
            "duration": 5,
            "is_active": True,
            "order": 1
        }
        
        success, content = self.run_test("Create Content", "POST", "content", 201, data=content_data)
        
        if success and 'id' in content:
            content_id = content['id']
            self.created_ids['content'].append(content_id)
            
            # Get all content
            success2, _ = self.run_test("Get All Content", "GET", "content", 200, auth_required=False)
            
            # Update content
            update_data = {
                "title": "Updated Test Announcement",
                "duration": 10
            }
            success3, _ = self.run_test("Update Content", "PUT", f"content/{content_id}", 200, data=update_data)
            
            # Delete content
            success4, _ = self.run_test("Delete Content", "DELETE", f"content/{content_id}", 200)
            
            return success2 and success3 and success4
        return False

    def test_agenda_crud(self):
        """Test agenda CRUD operations"""
        # Create agenda
        agenda_data = {
            "title": "Test Agenda",
            "description": "Test agenda description",
            "event_date": "2024-12-31",
            "event_time": "19:00",
            "location": "Test Location",
            "is_active": True
        }
        
        success, agenda = self.run_test("Create Agenda", "POST", "agenda", 201, data=agenda_data)
        
        if success and 'id' in agenda:
            agenda_id = agenda['id']
            self.created_ids['agenda'].append(agenda_id)
            
            # Get all agendas
            success2, _ = self.run_test("Get All Agendas", "GET", "agenda", 200, auth_required=False)
            
            # Update agenda
            update_data = {
                "title": "Updated Test Agenda",
                "location": "Updated Location"
            }
            success3, _ = self.run_test("Update Agenda", "PUT", f"agenda/{agenda_id}", 200, data=update_data)
            
            # Delete agenda
            success4, _ = self.run_test("Delete Agenda", "DELETE", f"agenda/{agenda_id}", 200)
            
            return success2 and success3 and success4
        return False

    def test_running_text_crud(self):
        """Test running text CRUD operations"""
        # Create running text
        text_data = {
            "text": "Test running text message",
            "is_active": True,
            "order": 1
        }
        
        success, text = self.run_test("Create Running Text", "POST", "running-text", 201, data=text_data)
        
        if success and 'id' in text:
            text_id = text['id']
            self.created_ids['running_text'].append(text_id)
            
            # Get all running texts
            success2, _ = self.run_test("Get All Running Texts", "GET", "running-text", 200, auth_required=False)
            
            # Update running text
            update_data = {
                "text": "Updated test running text message",
                "order": 2
            }
            success3, _ = self.run_test("Update Running Text", "PUT", f"running-text/{text_id}", 200, data=update_data)
            
            # Delete running text
            success4, _ = self.run_test("Delete Running Text", "DELETE", f"running-text/{text_id}", 200)
            
            return success2 and success3 and success4
        return False

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        return self.run_test("Get Dashboard Stats", "GET", "stats", 200)

    def cleanup_created_resources(self):
        """Clean up any resources created during testing"""
        print("\n🧹 Cleaning up created resources...")
        
        for resource_type, ids in self.created_ids.items():
            for resource_id in ids:
                try:
                    endpoint = resource_type.replace('_', '-')
                    url = f"{self.base_url}/api/{endpoint}/{resource_id}"
                    headers = {'Authorization': f'Bearer {self.token}'}
                    response = requests.delete(url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        print(f"   ✅ Deleted {resource_type} {resource_id}")
                    else:
                        print(f"   ⚠️  Could not delete {resource_type} {resource_id}")
                except:
                    pass

def main():
    print("🚀 Starting KHGT Digital Prayer Time API Tests")
    print("=" * 60)
    
    tester = KHGTAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_root_endpoint),
        ("User Registration", tester.test_register_user),
        ("Get Current User", tester.test_get_me),
        ("Mosque Identity", tester.test_mosque_identity),
        ("Prayer Settings", tester.test_prayer_settings),
        ("Layout Settings", tester.test_layout_settings),
        ("Prayer Times", tester.test_prayer_times),
        ("Content CRUD", tester.test_content_crud),
        ("Agenda CRUD", tester.test_agenda_crud),
        ("Running Text CRUD", tester.test_running_text_crud),
        ("Dashboard Stats", tester.test_dashboard_stats),
    ]
    
    # If registration fails, try login
    if not tester.test_register_user():
        print("\n⚠️  Registration failed, trying login...")
        if not tester.test_login_user():
            print("❌ Both registration and login failed. Cannot proceed with authenticated tests.")
            return 1
    
    # Run remaining tests
    for test_name, test_func in tests[1:]:  # Skip registration since we already tested it
        try:
            test_func()
        except Exception as e:
            print(f"❌ Error in {test_name}: {str(e)}")
            tester.tests_run += 1
    
    # Cleanup
    tester.cleanup_created_resources()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 BACKEND TEST RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())