"""
Brevo (Sendinblue) Email Backend using HTTP API.

Uses Brevo's HTTP API to send emails instead of SMTP.
This bypasses network restrictions that block outgoing SMTP on cloud platforms like Railway.
"""

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class BrevoEmailBackend(BaseEmailBackend):
    """
    Email backend that sends emails via Brevo HTTP API.

    Required settings:
        BREVO_API_KEY: Your Brevo API key
        DEFAULT_FROM_EMAIL: The from address for emails (must be verified in Brevo)
    """

    API_URL = "https://api.brevo.com/v3/smtp/email"

    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, "BREVO_API_KEY", "")

    def send_messages(self, email_messages):
        """Send one or more EmailMessage objects and return the number sent."""
        if not self.api_key:
            if not self.fail_silently:
                raise ValueError("BREVO_API_KEY is not configured")
            return 0

        num_sent = 0
        for message in email_messages:
            try:
                if self._send(message):
                    num_sent += 1
            except Exception as e:
                if not self.fail_silently:
                    raise
                print(f"Brevo email failed: {e}")
        return num_sent

    def _send(self, message):
        """Send a single EmailMessage via Brevo HTTP API."""
        # Parse the from email
        from_email = message.from_email or settings.DEFAULT_FROM_EMAIL
        from_name, from_addr = self._parse_email(from_email)

        # Build recipient lists
        to_list = [{"email": addr} for addr in (message.to or [])]
        cc_list = [{"email": addr} for addr in (message.cc or [])]
        bcc_list = [{"email": addr} for addr in (message.bcc or [])]

        if not to_list:
            return False

        # Build the payload
        payload = {
            "sender": {"name": from_name, "email": from_addr},
            "to": to_list,
            "subject": message.subject,
        }

        # Add CC and BCC if present
        if cc_list:
            payload["cc"] = cc_list
        if bcc_list:
            payload["bcc"] = bcc_list

        # Handle HTML vs plain text
        if hasattr(message, "alternatives") and message.alternatives:
            for content, mimetype in message.alternatives:
                if mimetype == "text/html":
                    payload["htmlContent"] = content
                    break
            if message.body:
                payload["textContent"] = message.body
        else:
            payload["textContent"] = message.body

        # Send via Brevo API
        headers = {
            "accept": "application/json",
            "api-key": self.api_key,
            "content-type": "application/json",
        }

        response = requests.post(self.API_URL, json=payload, headers=headers, timeout=10)

        if response.status_code in (200, 201):
            print(f"Brevo email sent: {response.json()}")
            return True
        else:
            error_msg = f"Brevo API error: {response.status_code} - {response.text}"
            print(error_msg)
            if not self.fail_silently:
                raise Exception(error_msg)
            return False

    def _parse_email(self, email_string):
        """Parse 'Name <email@example.com>' format into (name, email)."""
        import re

        match = re.match(r"^(.+?)\s*<(.+?)>$", email_string)
        if match:
            return match.group(1).strip(), match.group(2).strip()
        return "", email_string.strip()
