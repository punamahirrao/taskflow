import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
SECRET_KEY = os.getenv("SECRET_KEY", "local-only-estimator-key")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if host.strip()]
INSTALLED_APPS = ["django.contrib.auth", "django.contrib.contenttypes", "rest_framework", "runs"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware"]
ROOT_URLCONF = "estimator.urls"
database_path = Path(os.getenv("TASKFLOW_DB_PATH", str(BASE_DIR.parent / "backend" / "db.sqlite3")))
if not database_path.is_absolute():
    database_path = (BASE_DIR / database_path).resolve()
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": str(database_path)}}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
HOST_SERVICE_TOKEN = os.getenv("HOST_SERVICE_TOKEN", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
MAX_DOCUMENT_BYTES = int(os.getenv("MAX_DOCUMENT_BYTES", "26214400"))
ESTIMATOR_DOCUMENTS_ROOT = Path(os.getenv("ESTIMATOR_DOCUMENTS_ROOT", str(BASE_DIR / "uploads")))
if not ESTIMATOR_DOCUMENTS_ROOT.is_absolute():
    ESTIMATOR_DOCUMENTS_ROOT = (BASE_DIR / ESTIMATOR_DOCUMENTS_ROOT).resolve()
MEDIA_ROOT = ESTIMATOR_DOCUMENTS_ROOT
MEDIA_URL = "/estimator-media/"
STORY_POINT_SCALE = tuple(int(value) for value in os.getenv("STORY_POINT_SCALE", "1,2,3,5,8,13").split(","))
REST_FRAMEWORK = {"DEFAULT_AUTHENTICATION_CLASSES": [], "DEFAULT_PERMISSION_CLASSES": []}
