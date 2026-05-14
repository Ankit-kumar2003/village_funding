#!/usr/bin/env bash
# Render Build Script
# This runs automatically during each deploy

set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py create_superuser_auto
