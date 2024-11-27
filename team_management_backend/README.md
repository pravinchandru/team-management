# TeamMember App Backend

This repo contains the Django python code for team member management web app.

## Installation

```bash
cd team_management_backend/
python -m venv env
source env/bin/activate
pip install django djangorestframework django-cors-headers
```

## Migrations 
[Make sure you are in env]

```bash
python -m venv env
source env/bin/activate
python manage.py makemigrations --settings=core.settings.local
python manage.py migrate --settings=core.settings.local
```


## Test

```bash
python manage.py test --settings=core.settings.local team_members.tests.test_views
python manage.py test --settings=core.settings.local team_members.tests.test_models
python manage.py test --settings=core.settings.local team_members.tests.test_serializers
python manage.py test --settings=core.settings.local team_members.tests.test_integration
```

## DB

```bash
python manage.py dbshell --settings=core.settings.local
```

## Run

```bash
python manage.py runserver --settings=core.settings.local
```

App running at

```bash
http://127.0.0.1:8000/
```

