# 2M - MailMarketing

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Angular](https://img.shields.io/badge/frontend-angular-red)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Modern Email Marketing Platform with Admin Dashboard and Subscriber Management.

2M - MailMarketing is a full-stack email marketing management system that provides subscriber management, campaign infrastructure, and a modern multilingual admin interface.

---

# Features

Admin Panel

- Dashboard analytics
- Subscriber management
- Template management
- Campaign sending
- Reporting and analytics
- System settings
- User management

Localization

- TR / EN language switching
- ngx-translate based architecture
- reactive language toggle
- centralized I18nService

Subscriber System

- Public subscription page
- Subscriber registration
- Subscriber filtering
- Subscriber list management

Infrastructure

- Docker development environment
- PostgreSQL database
- Angular admin frontend
- REST backend API

---

# Admin Interface

The project includes a modern Angular-based admin panel.

Admin pages include:

- Dashboard
- Subscribers
- Templates
- Send
- Reporting
- Settings
- Users
- Profile

The admin interface supports dynamic language switching between Turkish and English.

---

# Public Subscription Page

A public-facing subscription page allows users to join the mailing list.

Features include:

- Newsletter signup
- Email capture
- Campaign updates

---

# Technology Stack

Frontend

- Angular
- PrimeNG
- TypeScript

Backend

- .NET API
- REST architecture

Database

- PostgreSQL

Infrastructure

- Docker
- Docker Compose

Localization

- ngx-translate

Testing

- Selenium runtime verification

---

# Project Structure

frontend/

Angular admin UI

backend/

API server

docker-compose.yml

Local development environment

---

# Running the Project

Start the entire stack using Docker.

```bash
docker compose up -d
```

Then access:

Admin Panel

http://localhost:4200/admin

Public Subscription Page

http://localhost:4200/subscribe

---

# Development

Frontend development:

```bash
cd frontend/mail-marketing-ui
npm install
npm start
```

Backend development depends on .NET runtime.

---

# Localization System

The application uses ngx-translate with a centralized language service.

Language toggle buttons allow instant switching between Turkish and English across the admin interface.

Translation files are located in:

`src/assets/i18n/`

---

# Version History

## v1.0.0

Initial production-ready version.

Includes:

- Admin dashboard
- Subscriber management
- Campaign infrastructure
- Multilingual UI (TR/EN)
- Docker development environment

---

# License

MIT License

---

# Author

Kadir Ak

GitHub

https://github.com/kadiraktech
