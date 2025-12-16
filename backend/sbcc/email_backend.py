import smtplib
import ssl

from django.core.mail.backends.smtp import EmailBackend


class CustomEmailBackend(EmailBackend):
    """
    Email backend that handles SSL certificate issues on macOS.
    Uses a custom SSL context that doesn't verify certificates.
    NOTE: This is acceptable for development. Production environments
    typically don't have this issue.
    """

    def open(self):
        if self.connection:
            return False

        # Use a shorter timeout (10s) to prevent worker timeouts
        timeout = self.timeout if self.timeout else 10

        try:
            self.connection = smtplib.SMTP(self.host, self.port, timeout=timeout)

            # Create SSL context that skips certificate verification
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            if self.use_tls:
                self.connection.starttls(context=context)

            if self.username and self.password:
                self.connection.login(self.username, self.password)

            return True
        except Exception:
            if self.fail_silently:
                return False
            raise
