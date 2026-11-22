import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
DATA_ENV = os.getenv("TASKFLOW_DATA_ENV", "development")
if DATA_ENV not in {"development", "test", "preprod"}:
    raise ValueError("TASKFLOW_DATA_ENV must be development, test, or preprod")
load_dotenv(BASE_DIR / f".env.{DATA_ENV}")
SECRET_KEY = os.getenv("SECRET_KEY", "local-only-estimator-key")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "rest_framework",
    "runs",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
]
ROOT_URLCONF = "estimator.urls"
default_database = (
    BASE_DIR.parent
    / "backend"
    / ("db.sqlite3" if DATA_ENV == "development" else f"db.{DATA_ENV}.sqlite3")
)
database_path = Path(
    os.getenv(
        f"{DATA_ENV.upper()}_TASKFLOW_DB_PATH",
        os.getenv("TASKFLOW_DB_PATH", str(default_database))
        if DATA_ENV == "development"
        else str(default_database),
    )
)
if not database_path.is_absolute():
    database_path = (BASE_DIR / database_path).resolve()
DATABASES = {
    "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": str(database_path)}
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"
HOST_SERVICE_TOKEN = os.getenv("HOST_SERVICE_TOKEN", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
MAX_DOCUMENT_BYTES = int(os.getenv("MAX_DOCUMENT_BYTES", "26214400"))
ESTIMATOR_DOCUMENTS_ROOT = Path(
    os.getenv(
        f"{DATA_ENV.upper()}_ESTIMATOR_DOCUMENTS_ROOT",
        os.getenv("ESTIMATOR_DOCUMENTS_ROOT", str(BASE_DIR / "uploads"))
        if DATA_ENV == "development"
        else str(BASE_DIR / "uploads" / DATA_ENV),
    )
)
if not ESTIMATOR_DOCUMENTS_ROOT.is_absolute():
    ESTIMATOR_DOCUMENTS_ROOT = (BASE_DIR / ESTIMATOR_DOCUMENTS_ROOT).resolve()
MEDIA_ROOT = ESTIMATOR_DOCUMENTS_ROOT
MEDIA_URL = "/estimator-media/"
STORY_POINT_SCALE = tuple(
    int(value) for value in os.getenv("STORY_POINT_SCALE", "1,2,3,5,8,13").split(",")
)
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
}
