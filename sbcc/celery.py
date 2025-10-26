from __future__ import absolute_import, unicode_literals
import sys
import os
from celery import Celery

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.sbcc.settings")

app = Celery("sbcc")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f"Celery debug task. Request: {self.request!r}")
    return "ok"
