# Changelog

## [0.1.0] - 2026-02-19

### Added
- Initial monorepo structure (`backend`, `frontend`)
- .NET 8 n-tier backend with JWT, AES-GCM, MailKit, EF Core, PostgreSQL
- Angular frontend with routing, guards, interceptor and CoreUI-based pages
- Docker Compose setup for postgres, backend, frontend
- Unit tests for JWT token generation and AES encrypt/decrypt roundtrip

### Changed
- Service layer refactored to interface-driven design
- Global exception handling with status mapping and traceId response payload
- Swagger configured with Bearer auth scheme
- Migration snapshot aligned to include all entities
