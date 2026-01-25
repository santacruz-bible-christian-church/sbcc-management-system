import logging
from urllib.parse import urljoin

import boto3
from botocore.client import Config
from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible

logger = logging.getLogger(__name__)


@deconstructible
class R2Storage(Storage):
    """
    Custom storage backend for Cloudflare R2
    Compatible with Django's file storage API
    """

    def __init__(self):
        logger.debug("Initializing R2Storage backend")

        # Check if R2 is configured
        if not getattr(settings, "USE_R2_STORAGE", False):
            raise ValueError("R2 storage is not enabled. Set USE_R2_STORAGE=true in your .env file")

        # Validate required settings
        required_settings = [
            "R2_ENDPOINT_URL",
            "R2_ACCESS_KEY_ID",
            "R2_SECRET_ACCESS_KEY",
            "R2_BUCKET_NAME",
            "R2_PUBLIC_URL",
        ]

        missing = []
        for s in required_settings:
            val = getattr(settings, s, None)
            if not val:
                missing.append(s)

        if missing:
            raise ValueError(
                f"Missing required R2 settings: {', '.join(missing)}\n"
                f"Make sure USE_R2_STORAGE=true and all R2_* variables are set in .env"
            )

        logger.debug(f"R2 Config: bucket={settings.R2_BUCKET_NAME}")

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL

    def _save(self, name, content):
        """Save file to R2"""
        # Normalize path separators to forward slashes for S3/R2
        name = name.replace("\\", "/")

        try:
            self.s3_client.upload_fileobj(
                content,
                self.bucket_name,
                name,
                ExtraArgs={
                    "ContentType": getattr(content, "content_type", "application/octet-stream")
                },
            )
            logger.info(f"Uploaded to R2: {name}")
            return name
        except Exception as e:
            logger.error(f"Failed to upload {name} to R2: {e}")
            raise IOError(f"Error uploading to R2: {str(e)}")

    def _open(self, name, mode="rb"):
        """Open file from R2"""
        from django.core.files.base import ContentFile

        try:
            obj = self.s3_client.get_object(Bucket=self.bucket_name, Key=name)
            return ContentFile(obj["Body"].read())
        except Exception as e:
            raise IOError(f"Error opening file from R2: {str(e)}")

    def delete(self, name):
        """Delete file from R2"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=name)
        except Exception as e:
            raise IOError(f"Error deleting file from R2: {str(e)}")

    def exists(self, name):
        """Check if file exists in R2"""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=name)
            return True
        except Exception:
            return False

    def size(self, name):
        """Get file size"""
        try:
            obj = self.s3_client.head_object(Bucket=self.bucket_name, Key=name)
            return obj["ContentLength"]
        except Exception:
            return 0

    def url(self, name):
        """Return public URL for file"""
        return urljoin(self.public_url + "/", name)

    def get_available_name(self, name, max_length=None):
        """Generate unique filename"""
        import uuid
        from pathlib import Path

        # Normalize to forward slashes first
        name = name.replace("\\", "/")
        path = Path(name)
        unique_name = f"{path.stem}_{uuid.uuid4().hex[:8]}{path.suffix}"
        # Convert back to forward slashes for S3/R2
        result = str(Path(path.parent) / unique_name).replace("\\", "/")
        return result
