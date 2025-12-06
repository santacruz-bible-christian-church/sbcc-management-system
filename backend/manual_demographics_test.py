import sys

import requests

BASE_URL = "http://localhost:8000/api"
REQUEST_TIMEOUT = 30


def test_login(username, password):
    """Login and get access token"""
    print("=" * 70)
    print("Testing Login...")
    print("=" * 70)

    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"username": username, "password": password},
        timeout=REQUEST_TIMEOUT,
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"User: {data['user']['username']} ({data['user']['role']})")
        return data.get("access")
    else:
        print("❌ Login failed!")
        print(f"Error: {response.json()}")
        return None


def test_demographics(access_token):
    """Test overall demographics endpoint"""
    print("\n" + "=" * 70)
    print("Testing GET /api/members/demographics/")
    print("=" * 70)

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(
        f"{BASE_URL}/members/demographics/",
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✅ Demographics retrieved successfully!")
        print(f"\nTotal Members: {data.get('total_members', 0)}")
        print(f"Active Members: {data.get('active_members', 0)}")
        print(f"Inactive Members: {data.get('inactive_members', 0)}")

        print("\n📊 Gender Distribution:")
        gender = data.get("gender_distribution", {})
        print(f"  Male: {gender.get('male', 0)}")
        print(f"  Female: {gender.get('female', 0)}")
        print(f"  Other: {gender.get('other', 0)}")

        print("\n📊 Age Groups:")
        age_groups = data.get("age_groups", {})
        for age_range, count in age_groups.items():
            print(f"  {age_range}: {count}")

        print("\n📊 Ministry Distribution:")
        ministries = data.get("ministry_distribution", [])
        if ministries:
            for ministry in ministries[:5]:  # Top 5
                print(f"  {ministry['ministry_name']}: {ministry['count']}")
        else:
            print("  No ministry data")

        print(f"\nUnassigned Members: {data.get('unassigned_members', 0)}")

        return data
    else:
        print("❌ Failed to get demographics!")
        print(f"Error: {response.json()}")
        return None


def test_ministry_demographics(access_token, ministry_id):
    """Test ministry-specific demographics"""
    print("\n" + "=" * 70)
    print(f"Testing GET /api/members/ministry_demographics/?ministry={ministry_id}")
    print("=" * 70)

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(
        f"{BASE_URL}/members/ministry_demographics/",
        params={"ministry": ministry_id},
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✅ Ministry demographics retrieved successfully!")
        print(f"\nMinistry: {data.get('ministry_name', 'N/A')}")
        print(f"Total Members: {data.get('total_members', 0)}")

        print("\n📊 Gender Distribution:")
        gender = data.get("gender_distribution", {})
        print(f"  Male: {gender.get('male', 0)}")
        print(f"  Female: {gender.get('female', 0)}")
        print(f"  Other: {gender.get('other', 0)}")

        print("\n📊 Age Groups:")
        age_groups = data.get("age_groups", {})
        for category, count in age_groups.items():
            print(f"  {category.capitalize()}: {count}")

        return data
    elif response.status_code == 404:
        print("❌ Ministry not found!")
        print(f"Error: {response.json()}")
        return None
    else:
        print("❌ Failed to get ministry demographics!")
        print(f"Error: {response.json()}")
        return None


def test_dashboard_with_demographics(access_token):
    """Test dashboard stats with demographics"""
    print("\n" + "=" * 70)
    print("Testing GET /api/dashboard/stats/ (with demographics)")
    print("=" * 70)

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(
        f"{BASE_URL}/dashboard/stats/",
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✅ Dashboard stats retrieved!")

        if "demographics" in data:
            print("\n📊 Demographics Summary (from dashboard):")
            demo = data["demographics"]
            print(f"  Gender Distribution: {demo.get('gender_distribution', {})}")
            print(f"  Age Groups: {demo.get('age_groups', {})}")
            print(f"  Ministry Count: {demo.get('ministry_count', 0)}")
            print(f"  Unassigned Members: {demo.get('unassigned_members', 0)}")
        else:
            print("⚠️  No demographics in dashboard response")

        return data
    else:
        print("❌ Failed to get dashboard stats!")
        print(f"Error: {response.json()}")
        return None


def get_ministries(access_token):
    """Get list of ministries for testing"""
    print("\n" + "=" * 70)
    print("Getting ministries list...")
    print("=" * 70)

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(
        f"{BASE_URL}/ministries/",
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 200:
        data = response.json()
        ministries = data if isinstance(data, list) else data.get("results", [])

        if ministries:
            print(f"✅ Found {len(ministries)} ministries:")
            for ministry in ministries[:5]:
                print(f"  ID {ministry['id']}: {ministry['name']}")
            return ministries
        else:
            print("⚠️  No ministries found")
            return []
    else:
        print("❌ Failed to get ministries!")
        return []


def main():
    """Main test function"""
    print("\n" + "=" * 70)
    print("SBCC Demographics - Backend Test")
    print("=" * 70)

    # Get credentials
    print("\nEnter your admin credentials:")
    username = input("Username (default: admin): ").strip() or "admin"
    password = input("Password: ").strip()

    if not password:
        print("❌ Password is required!")
        sys.exit(1)

    # Test 1: Login
    access_token = test_login(username, password)
    if not access_token:
        print("\n❌ Login failed. Cannot proceed with other tests.")
        sys.exit(1)

    # Test 2: Overall Demographics
    demographics_data = test_demographics(access_token)
    if not demographics_data:
        print("\n⚠️  Demographics test failed, but continuing...")

    # Test 3: Get Ministries List
    ministries = get_ministries(access_token)

    # Test 4: Ministry-Specific Demographics
    if ministries:
        # Test first ministry
        first_ministry = ministries[0]
        test_ministry_demographics(access_token, first_ministry["id"])

        # Test invalid ministry
        print("\n" + "=" * 70)
        print("Testing with invalid ministry ID (should fail gracefully)...")
        print("=" * 70)
        test_ministry_demographics(access_token, 99999)
    else:
        print("\n⚠️  Skipping ministry demographics test (no ministries found)")

    # Test 5: Dashboard Stats
    test_dashboard_with_demographics(access_token)

    # Summary
    print("\n" + "=" * 70)
    print("✅ All Tests Completed!")
    print("=" * 70)

    if demographics_data:
        print("\n📊 Quick Summary:")
        print(f"  Total Members: {demographics_data.get('total_members', 0)}")
        print(f"  Active: {demographics_data.get('active_members', 0)}")
        print(
            f"  Ministries with Members: {len(demographics_data.get('ministry_distribution', []))}"
        )


if __name__ == "__main__":
    main()
