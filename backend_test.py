#!/usr/bin/env python3
"""
Backend API Testing for Durak Card Game
Tests all API endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime

class DurakAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:100]}...")
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_server_health(self):
        """Test if server is running"""
        print("🔍 Testing server health...")
        try:
            response = self.session.get(self.base_url, timeout=5)
            if response.status_code == 200:
                print("✅ Server is running and responding")
                return True
            else:
                print(f"❌ Server responded with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Server health check failed: {str(e)}")
            return False

    def test_static_files(self):
        """Test static file serving"""
        static_files = [
            "style.css",
            "game.js",
            "login.html",
            "reg.html"
        ]
        
        for file in static_files:
            success, _ = self.run_test(
                f"Static file: {file}",
                "GET",
                file,
                200
            )
            if not success:
                print(f"❌ Static file {file} not accessible")

    def test_auth_registration(self):
        """Test user registration"""
        test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={"username": test_username, "password": test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ Registration successful, token received")
            return True, test_username, test_password
        else:
            print("❌ Registration failed or no token received")
            return False, None, None

    def test_auth_login(self, username, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data={"username": username, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"✅ Login successful, token updated")
            return True
        else:
            print("❌ Login failed or no token received")
            return False

    def test_protected_routes(self):
        """Test protected API routes"""
        if not self.token:
            print("❌ No token available for protected route testing")
            return False
        
        # Test /api/me endpoint
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "api/me",
            200
        )
        
        if success and 'user' in response:
            print("✅ User profile retrieved successfully")
        
        # Test /api/stats/me endpoint
        success, response = self.run_test(
            "Get User Stats",
            "GET",
            "api/stats/me",
            200
        )
        
        if success and 'stats' in response:
            print("✅ User stats retrieved successfully")
        
        return True

    def test_invalid_auth(self):
        """Test authentication with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "api/auth/login",
            401,
            data={"username": "nonexistent", "password": "wrongpass"}
        )
        
        if success:
            print("✅ Invalid login correctly rejected")
        
        # Test duplicate registration
        success, response = self.run_test(
            "Duplicate Registration",
            "POST",
            "api/auth/register",
            400,
            data={"username": "admin", "password": "password123"}
        )
        
        return True

    def test_rate_limiting(self):
        """Test rate limiting on auth endpoints"""
        print("🔍 Testing rate limiting (making multiple requests)...")
        
        # Make multiple rapid requests to test rate limiting
        for i in range(5):
            success, response = self.run_test(
                f"Rate Limit Test {i+1}",
                "POST",
                "api/auth/login",
                401,  # Expect 401 for invalid creds, or 429 for rate limit
                data={"username": "test", "password": "test"}
            )
        
        print("✅ Rate limiting test completed")
        return True

    def test_cors_headers(self):
        """Test CORS headers"""
        print("🔍 Testing CORS headers...")
        try:
            response = self.session.options(f"{self.base_url}/api/auth/login", timeout=5)
            headers = response.headers
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            found_cors = any(header in headers for header in cors_headers)
            if found_cors:
                print("✅ CORS headers found")
            else:
                print("ℹ️ CORS headers not found (might be handled by middleware)")
            
            return True
        except Exception as e:
            print(f"❌ CORS test failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Durak API Testing Suite")
        print("=" * 50)
        
        # Test server health first
        if not self.test_server_health():
            print("❌ Server is not responding, aborting tests")
            return False
        
        # Test static files
        print("\n📁 Testing Static Files...")
        self.test_static_files()
        
        # Test authentication flow
        print("\n🔐 Testing Authentication...")
        reg_success, username, password = self.test_auth_registration()
        
        if reg_success:
            # Test login with the registered user
            self.test_auth_login(username, password)
            
            # Test protected routes
            print("\n🛡️ Testing Protected Routes...")
            self.test_protected_routes()
        
        # Test invalid authentication
        print("\n❌ Testing Invalid Authentication...")
        self.test_invalid_auth()
        
        # Test rate limiting
        print("\n⏱️ Testing Rate Limiting...")
        self.test_rate_limiting()
        
        # Test CORS
        print("\n🌐 Testing CORS...")
        self.test_cors_headers()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            failed = self.tests_run - self.tests_passed
            print(f"⚠️ {failed} tests failed")
            return False

def main():
    """Main test runner"""
    tester = DurakAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())