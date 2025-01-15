"""Django settings for app_web project.

Generated by 'django-admin startproject' using Django 4.2.3 and merged with settings.py from the MHS project finle.web.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

# import the logging library
import logging
import os
from datetime import timedelta
from pathlib import Path

import certifi
import sentry_sdk
from django.conf.global_settings import DATABASES
from sentry_sdk.integrations.django import DjangoIntegration

from app_web.env import env_get_allowed_hosts, env_get_allowed_origins, env_get_csrf_trusted_origins, env_get_raw_value

# Get an instance of a logger
logger = logging.getLogger(__name__)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env_get_raw_value("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env_get_raw_value("DEBUG") in (True, "True")

ALLOWED_HOSTS = env_get_allowed_hosts()
CSRF_TRUSTED_ORIGINS = env_get_csrf_trusted_origins()
USE_X_FORWARDED_HOST = True

# Application definition

INSTALLED_APPS = [
    "app_web.apps.FinleConfig",
    "bootstrap5",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "simple_history",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "ckeditor",
    "django_object_actions",
    # all auth apps
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.headless",
    "allauth.usersessions",
    # auth providers
    "allauth.socialaccount.providers.facebook",
    "allauth.socialaccount.providers.twitter",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.apple",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    # allauth middleware
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "app_web.urls"
SITE_ID = 1

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                # `allauth` needs this from django
                "django.template.context_processors.request",
            ],
        },
    },
]
REST_FRAMEWORK = {"DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",
                                                     "rest_framework.authentication.SessionAuthentication")}

SIMPLE_JWT = {
    # It will work instead of the default serializer(TokenObtainPairSerializer).
    # the refresh cookie is stored in a http only value so it can not be retrieved from javascript
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_COOKIE_PATH": "/",
    "REFRESH_COOKIE": "refresh",
    "REFRESH_COOKIE_HTTP_ONLY": True,
    "REFRESH_COOKIE_SECURE": True,
    "AUTH_COOKIE_SAMESITE": "Lax",
    "TOKEN_OBTAIN_SERIALIZER": "app_web.serializers.FinleTokenObtainPairSerializer",
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    # ...
}

WSGI_APPLICATION = "app_web.wsgi.application"

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
# Note that 'default' is the key that Django looks for when running the db initialization.
DATABASES["default"] = {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": env_get_raw_value("POSTGRES_NAME"),
    "USER": env_get_raw_value("POSTGRES_USER"),
    "PASSWORD": env_get_raw_value("POSTGRES_PASSWORD"),
    "HOST": env_get_raw_value("POSTGRES_HOST"),
    "PORT": 5432,  # default postgres port must be open when running docker locally
}


# CKEditor configs
CKEDITOR_BASEPATH = "/static/ckeditor/ckeditor/"

CKEDITOR_CONFIGS = {
    "default": {
        "toolbar_YourCustomToolbarConfig": [
            {"name": "clipboard", "items": ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo"]},
            {"name": "editing", "items": ["Find", "Replace", "-", "SelectAll"]},
            {"name": "forms", "items": ["Checkbox", "Radio", "TextField", "Textarea", "Select"]},
            "/",
            {"name": "basicstyles", "items": ["Bold", "Italic", "Underline", "Strike"]},
            {
                "name": "paragraph",
                "items": [
                    "NumberedList",
                    "BulletedList",
                    "-",
                    "Outdent",
                    "Indent",
                    "-",
                    "Blockquote",
                    "CreateDiv",
                    "-",
                    "JustifyLeft",
                    "JustifyCenter",
                    "JustifyRight",
                    "JustifyBlock",
                ],
            },
            {"name": "links", "items": ["Link", "Unlink", "Anchor"]},
            {"name": "styles", "items": ["Format"]},
            "/",  # put this to force next toolbar on new line
            {
                "name": "yourcustomtools",
                "items": [
                    # put the name of your editor.ui.addButton here
                    "Preview",
                    "Maximize",
                ],
            },
        ],
        "format_tags": "p;h1;h2",  # entries is displayed in "Paragraph format"
        "format_p": {
            "name": "normal",
            "element": "p",
            "styles": {
                "font-family": '"Open Sans", sans-serif',
            },
        },
        "format_h1": {
            "name": "Header 1",
            "element": "h1",
            "styles": {
                "font-size": "4.5rem",
                "color": "rgb(0, 115, 152)",
                "font-family": '"Arial Rounded MT Bold", serif',
                "font-weight": "400",
            },
        },
        "format_h2": {
            "name": "Header 2",
            "element": "h2",
            "styles": {
                "font-size": "1.875rem",
                "color": "rgb(0, 115, 152)",
                "font-family": '"Arial Rounded MT Bold", serif',
                "font-weight": "400",
            },
        },
        "toolbar": "YourCustomToolbarConfig",  # put selected toolbar config here
        "extraPlugins": "forms,div,formmodplugin",
        "allowContent": True,
        "extraAllowedContent": "input[data-*];textarea[data-*]",
        "removePlugins": "exportpdf, stylesheetparser",
        # CKEDITOR.plugins.addExternal(...)
        "external_plugin_resources": [("formmodplugin", "/static/", "formModPlugin.js")],
    },
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    # allauth authentications
    "allauth.account.auth_backends.AuthenticationBackend",
]

HEADLESS = True
HEADLESS_ONLY = True
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "/account/verify-email/{key}",
    "account_reset_password": "/account/password/reset",
    "account_reset_password_from_key": "/account/password/reset/key/{key}",
    "account_signup": "/account/signup",
    "socialaccount_login_error": "/account/provider/error",
}
SOCIALACCOUNT_ADAPTER = "app_web.views.auth.service.FinleSocialAccountAdapter"

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# LOGGING just stream to console for now
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        # "django.db.backends": {
        #    "level": "DEBUG",
        #    "handlers": ["console"],
        # },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_ROOT = "app_web/static"
STATIC_URL = "static/"

# Media files
MEDIA_ROOT = "app_web/media"
MEDIA_URL = "media/"

# Silence ckeditor warning since it is only used in the admin page
SILENCED_SYSTEM_CHECKS = ["ckeditor.W001"]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

ACCESS_CONTROL_ALLOW_HEADERS = True
CORS_ALLOW_HEADERS = (
    "content-disposition",
    "accept-encoding",
    "authorization",
    "content-type",
    "accept",
    "origin",
    "x-csrftoken",
    "x-csrf-token",
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env_get_allowed_origins()
CORS_ALLOW_ALL_ORIGINS = env_get_raw_value("CORS_ALLOW_ALL_ORIGINS") in (True, "True")

AUTH_USER_MODEL = "app_web.User"

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = None

# the url for the front end host
FRONT_END_HOST = env_get_raw_value("FRONT_END_HOST")

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env_get_raw_value("EMAIL_HOST")
EMAIL_PORT = env_get_raw_value("EMAIL_PORT")
EMAIL_HOST_USER = env_get_raw_value("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env_get_raw_value("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = env_get_raw_value("EMAIL_USE_TLS")
EMAIL_USE_SSL = False

# Set the env cert file
os.environ["SSL_CERT_FILE"] = certifi.where()
