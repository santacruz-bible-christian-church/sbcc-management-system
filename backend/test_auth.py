import requests
import sys

BASE_URL = "http://localhost:8000/api/auth"

def test_login(username, password):
    """Test login endpoint"""
    print("=" * 50)
    print("Testing Login...")
    print("=" * 50)
    
    response = requests.post(f"{BASE_URL}/login/", json={
        "username": username,
        "password": password
    })
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"User: {data['user']['username']} ({data['user']['role']})")
        print(f"Access Token: {data['access'][:50]}...")
        print(f"Refresh Token: {data['refresh'][:50]}...")
        return data
    else:
        print("❌ Login failed!")
        print(f"Error: {response.json()}")
        return None

def test_get_current_user(access_token):
    """Test get current user endpoint"""
    print("\n" + "=" * 50)
    print("Testing Get Current User...")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/me/", headers=headers)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Got current user!")
        print(f"Username: {data['username']}")
        print(f"Email: {data['email']}")
        print(f"Role: {data['role']}")
    else:
        print("❌ Failed to get current user!")
        print(f"Error: {response.json()}")

def test_refresh_token(refresh_token):
    """Test refresh token endpoint"""
    print("\n" + "=" * 50)
    print("Testing Refresh Token...")
    print("=" * 50)
    
    response = requests.post(f"{BASE_URL}/refresh/", json={
        "refresh": refresh_token
    })
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Token refreshed!")
        print(f"New Access Token: {data['access'][:50]}...")
        if 'refresh' in data:
            print(f"New Refresh Token: {data['refresh'][:50]}...")
        return data
    else:
        print("❌ Failed to refresh token!")
        print(f"Error: {response.json()}")
        return None

def test_logout(access_token, refresh_token):
    """Test logout endpoint"""
    print("\n" + "=" * 50)
    print("Testing Logout...")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/logout/", 
                            headers=headers,
                            json={"refresh_token": refresh_token})
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Logout successful!")
        print(response.json())
    else:
        print("❌ Logout failed!")
        print(f"Error: {response.json()}")

def test_register(access_token):
    """Test register endpoint (admin only)"""
    print("\n" + "=" * 50)
    print("Testing Register New User (Admin Only)...")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/register/", 
                            headers=headers,
                            json={
                                "username": "testuser",
                                "email": "test@sbcc.org",
                                "password": "TestPass123!",
                                "password2": "TestPass123!",
                                "first_name": "Test",
                                "last_name": "User",
                                "role": "member",
                                "phone": "09123456789"
                            })
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print("✅ User registered successfully!")
        print(f"New User: {data['user']['username']}")
    else:
        print("❌ Registration failed!")
        print(f"Error: {response.json()}")

def main():
    """Main test function"""
    print("\n" + "=" * 50)
    print("SBCC Authentication System - API Test")
    print("=" * 50)
    
    # Get credentials from user
    print("\nEnter your admin credentials:")
    username = input("Username: ").strip() or "admin"
    password = input("Password: ").strip()
    
    if not password:
        print("❌ Password is required!")
        sys.exit(1)
    
    # Test 1: Login
    login_data = test_login(username, password)
    if not login_data:
        print("\n❌ Login failed. Cannot proceed with other tests.")
        sys.exit(1)
    
    access_token = login_data.get('access')
    refresh_token = login_data.get('refresh')
    
    # Test 2: Get Current User
    test_get_current_user(access_token)
    
    # Test 3: Refresh Token
    new_tokens = test_refresh_token(refresh_token)
    if new_tokens:
        # Update tokens with new ones
        access_token = new_tokens.get('access', access_token)
        refresh_token = new_tokens.get('refresh', refresh_token)
    
    # Test 4: Register New User (only if admin)
    if login_data['user']['role'] == 'admin':
        test_register(access_token)
    else:
        print("\n⚠️  Skipping register test (admin only)")
    
    # Test 5: Logout
    test_logout(access_token, refresh_token)
    
    print("\n" + "=" * 50)
    print("All tests completed!")
    print("=" * 50)

if __name__ == "__main__":
    main()