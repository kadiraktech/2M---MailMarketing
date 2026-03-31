# 2M - MailMarketing

2M - MailMarketing is a full-stack email marketing platform with a multilingual Angular admin application and a .NET backend for subscriber management, template management, campaign sending, reporting, live operational visibility, and rule-based campaign recommendations.

## Overview

The project is organized as a monorepo with:

- `frontend/mail-marketing-ui`: Angular 19 admin and public subscription UI
- `backend`: .NET 8 API, business layer, domain models, data access, background worker, and tests
- `docker-compose.yml`: local development stack for frontend, backend, PostgreSQL, Redis, RabbitMQ, and SonarQube

The current product direction is practical and operator-focused:

- campaign management and bulk send operations
- live operational dashboard for admin users
- rule-based recommendation support for campaign planning
- clear separation between recommendations and actual send execution

## Current Architecture

### Frontend

- Angular 19 standalone components
- PrimeNG UI components
- ngx-translate for Turkish / English localization
- admin shell with authenticated routes
- public subscription page

### Backend

- .NET 8 Web API
- layered structure across API, Business, Data, and Domain projects
- Entity Framework Core with PostgreSQL
- JWT-based authentication and role-aware admin access
- background mail queue worker with polling-based processing

### Infrastructure

- PostgreSQL for application data
- Redis provisioned in local stack
- RabbitMQ provisioned in local stack
- Docker / Docker Compose for local startup

Note:

- RabbitMQ is configured in the environment and surfaced honestly in health output, but it is not currently part of the active mail send flow.
- Campaign recommendations are currently rule-based and LLM-ready in structure, but there is no real LLM integration yet.

## Major Implemented Features

### Admin Product Areas

- Dashboard
- Subscribers
- Templates
- Send
- Reporting
- Settings
- Users
- Profile

### Subscriber and Campaign Operations

- public newsletter subscription flow
- subscriber listing, filtering, and management
- template management with active/inactive state
- authenticated bulk send queue creation
- reporting over send items and batches

### Live Admin Dashboard

The admin dashboard now includes a polling-based live operations view backed by:

- queue metrics
  - total queued jobs
  - processing jobs
  - retry-pending jobs
- sending metrics
  - active send operations
  - successful send count
  - failed send count
- recent activity feed
- system health summary for:
  - API
  - database
  - RabbitMQ
  - worker heartbeat

Implementation notes:

- frontend polls the backend every 10 seconds
- backend health remains truthful
- worker health uses minimal in-memory heartbeat telemetry
- no WebSocket layer is used in the current version

### Campaign Recommendation Engine

The send page includes a recommendation workflow for admin / campaign manager users.

Supported campaign goals:

- `ProductLaunch`
- `DiscountOffer`
- `ReEngagement`
- `Newsletter`
- `SpecialAnnouncement`

Current recommendation areas:

- subject suggestions
- audience suggestions
- send time suggestions
- performance / failure insights

Recommendation experience principles:

- recommendation + review + user confirmation
- no auto-send
- no auto-apply into the send flow
- deterministic and explainable output

### Insight Signal Categories and Recommendation Metadata

Recommendation insights now support lightweight signal categories:

- `Opportunity`
- `Caution`
- `DeliveryStrategy`
- `AudienceFit`
- `MessagingQuality`

Recommendation responses also include provider-oriented metadata for future evolution:

- provider name and display name
- provider type
- generation mode
- explanation style
- recommendation version

These fields are intended to support future provider evolution cleanly without overstating current AI capability.

## Technology Stack

### Frontend

- Angular 19
- TypeScript
- PrimeNG
- ngx-translate

### Backend

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- Npgsql / PostgreSQL

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL 16
- Redis 7
- RabbitMQ 3 Management
- SonarQube Community

### Testing and Verification

- .NET unit tests
- Docker-based Angular production build verification
- Selenium test project present under frontend tests

## Repository Structure

```text
frontend/
  mail-marketing-ui/

backend/
  src/
  tests/

scripts/
docker-compose.yml
README.md
```

## Local Run with Docker

Start the full local stack:

```bash
docker compose up -d --build
```

Main URLs and ports:

- Frontend admin: `http://localhost:4200/admin`
- Frontend public subscribe page: `http://localhost:4200/subscribe`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ Management: `http://localhost:15672`
- SonarQube: `http://localhost:9000`

Development note:

- Swagger UI is available when the backend runs in Development mode.

## Frontend Development

```bash
cd frontend/mail-marketing-ui
npm install
npm start
```

## Backend Development

```bash
dotnet build backend/MailMarketing.sln
dotnet test backend/MailMarketing.sln
```

## Verification Notes

Recently verified feature areas include:

- live admin dashboard frontend and backend
- live-dashboard polling endpoint
- worker heartbeat telemetry
- rule-based campaign recommendation backend
- recommendation flow on the send page
- insight signal categories
- provider metadata display

Verification approach used in this repository:

- backend solution build
- backend tests
- Docker-based Angular build when host npm is unavailable

## Recommendation Engine Status

The recommendation engine is currently:

- rule-based
- deterministic
- explainable
- safe for review-first workflows
- structured for future provider evolution

It is not currently:

- real LLM generation
- automated send optimization
- personalized model scoring
- confidence-based ML output

## License

MIT License

## Author

Kadir Ak  
GitHub: https://github.com/kadiraktech
