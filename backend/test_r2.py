import os

# Load .env file before Django setup
from pathlib import Path

import django
from dotenv import load_dotenv

# Get the backend directory and load .env
backend_dir = Path(__file__).resolve().parent
dotenv_path = backend_dir / ".env"
load_dotenv(dotenv_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sbcc.settings")
django.setup()

from django.core.files.base import ContentFile

from common.storage import R2Storage


def test_r2_upload():
    storage = R2Storage()

    # Test file
    content = ContentFile(b"Hello from SBCC Management System!")
    filename = "test/test_file.txt"

    try:
        # Upload
        print("📤 Uploading to R2...")
        saved_name = storage.save(filename, content)
        print(f"✅ Uploaded: {saved_name}")

        # Get URL
        url = storage.url(saved_name)
        print(f"🔗 Public URL: {url}")

        # Check exists
        exists = storage.exists(saved_name)
        print(f"📁 File exists: {exists}")

        # Get size
        size = storage.size(saved_name)
        print(f"📊 File size: {size} bytes")

        # Delete
        print("🗑️  Deleting from R2...")
        storage.delete(saved_name)
        print("✅ Deleted successfully!")

        print("\n🎉 R2 storage test passed!")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    test_r2_upload()
