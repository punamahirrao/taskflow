"""Hardened production settings; all deployment secrets come from environment."""

import os

from .base import *  # noqa: F403

DEBUG = False
SECRET_KEY = os.environ["SECRET_KEY"]
ALLOWED_HOSTS = [
    host.strip() for host in os.environ["ALLOWED_HOSTS"].split(",") if host.strip()
]
if not SECRET_KEY.strip():
    raise RuntimeError("SECRET_KEY must not be empty in production.")
if not ALLOWED_HOSTS:
    raise RuntimeError(
        "ALLOWED_HOSTS must contain at least one hostname in production."
    )
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be configured for production.")

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "true").lower() == "true"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
