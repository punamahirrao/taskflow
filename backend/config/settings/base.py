"""Settings shared by local development, tests, and production."""

import os
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
DATA_ENV = os.environ.get("TASKFLOW_DATA_ENV", "development")
if DATA_ENV not in {"development", "test", "preprod"}:
    raise ValueError("TASKFLOW_DATA_ENV must be development, test, or preprod")
load_dotenv(BASE_DIR / f".env.{DATA_ENV}")

BASE_SECRET_KEY = os.environ.get("SECRET_KEY", "insecure-development-only")
# A token from one data environment must never authenticate a same-ID user in
# another database. Keep the legacy development key; namespace other profiles.
SECRET_KEY = os.environ.get(f"{DATA_ENV.upper()}_SECRET_KEY") or (
    BASE_SECRET_KEY if DATA_ENV == "development" else f"{BASE_SECRET_KEY}:{DATA_ENV}"
)
DEBUG = False
ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
MICROSOFT_CLIENT_ID = os.environ.get("MICROSOFT_CLIENT_ID", "")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "accounts",
    "projects",
    "tasks",
    "documents",
    "dashboard",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "accounts.audit.AuditContextMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASE_URL = os.environ.get(f"{DATA_ENV.upper()}_DATABASE_URL", "")
if DATA_ENV == "development":
    DATABASE_URL = DATABASE_URL or os.environ.get("DATABASE_URL", "")
DATABASE_PATH = BASE_DIR / (
    "db.sqlite3" if DATA_ENV == "development" else f"db.{DATA_ENV}.sqlite3"
)
DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    if DATABASE_URL
    else {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": DATABASE_PATH,
        "OPTIONS": {"timeout": 20},
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"
MEDIA_ROOT = (
    BASE_DIR / "media" if DATA_ENV == "development" else BASE_DIR / "media" / DATA_ENV
)
PROFILE_PICS_ROOT = Path(
    os.environ.get(
        f"{DATA_ENV.upper()}_PROFILE_PICS_ROOT",
        os.environ.get("PROFILE_PICS_ROOT", str(MEDIA_ROOT / "profilepics"))
        if DATA_ENV == "development"
        else str(MEDIA_ROOT / "profilepics"),
    )
)
PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
DOCUMENTS_ROOT = Path(
    os.environ.get(
        f"{DATA_ENV.upper()}_DOCUMENTS_ROOT",
        os.environ.get("DOCUMENTS_ROOT", str(MEDIA_ROOT / "documents"))
        if DATA_ENV == "development"
        else str(MEDIA_ROOT / "documents"),
    )
)
DOCUMENTS_MAX_UPLOAD_BYTES = 25 * 1024 * 1024
AI_ESTIMATOR_SERVICE_URL = os.environ.get(
    f"{DATA_ENV.upper()}_AI_ESTIMATOR_SERVICE_URL",
    os.environ.get("AI_ESTIMATOR_SERVICE_URL", "http://127.0.0.1:8100"),
)
AI_ESTIMATOR_SERVICE_TOKEN = os.environ.get("AI_ESTIMATOR_SERVICE_TOKEN", "")

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:5174").split(
        ","
    )
    if origin.strip()
]
if DATA_ENV in {"preprod", "test"}:
    CORS_ALLOWED_ORIGINS += [
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ]
CORS_ALLOW_HEADERS = (*default_headers, "x-organization-id")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "accounts.authentication.OrganizationJWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "common.exceptions.handler.api_exception_handler",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "TaskFlow API",
    "DESCRIPTION": "Agile project planning and delivery API.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
