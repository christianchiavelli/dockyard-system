# Dockyard API

REST API for employee hierarchy management with drag-and-drop capabilities.

## Tech Stack

- **NestJS** 11.x - Node.js framework
- **TypeORM** 0.3.x - ORM with SQLite
- **TypeScript** 5.7.x - Strict mode enabled
- **Swagger/OpenAPI** - API documentation
- **Jest** - Unit and E2E testing

## Architecture

```
src/
├── employees/           # Employee module
│   ├── employee.entity.ts    # TypeORM entity with self-referencing relations
│   ├── employee.dto.ts       # Data validation with class-validator
│   ├── employees.service.ts  # Business logic (CRUD, hierarchy, search)
│   └── employees.controller.ts # REST endpoints
├── app.module.ts        # Application module
├── app.service.ts       # Health check & root info
└── main.ts             # Bootstrap & Swagger configuration
```

## Installation

```bash
npm install
```

## Database Setup

The application uses SQLite with automatic schema synchronization. To populate with sample data:

```bash
npm run seed
```

This creates 1000 employee records from `employees.json`.

## Running the Application

```bash
# Development with watch mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at:
- Application: http://localhost:3000
- API Documentation: http://localhost:3000/api
- Health Check: http://localhost:3000/health

## API Endpoints

### Employee Management
- `GET /api/employees` - List all employees or search by name
- `GET /api/employees/hierarchy` - Get hierarchical tree structure
- `GET /api/employees/roots` - Get root-level employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `POST /api/employees/bulk` - Bulk employee creation
- `PUT /api/employees/:id` - Update employee
- `PUT /api/employees/:id/hierarchy` - Update reporting structure
- `DELETE /api/employees/:id` - Delete employee (validates no subordinates)

### System
- `GET /` - API information
- `GET /health` - Health check with database status

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Test suite includes 25 E2E tests covering all endpoints with validation scenarios.

## Code Quality

```bash
# Linting
npm run lint

# Code formatting
npm run format
```

The project enforces TypeScript strict mode and uses ESLint + Prettier for consistency.

## Features

- **Hierarchical Management**: Self-referencing employee relationships with cycle detection
- **Input Validation**: DTO validation with class-validator decorators
- **Type Safety**: Full TypeScript coverage with strict mode
- **API Documentation**: Auto-generated Swagger UI with examples
- **Error Handling**: Proper HTTP status codes and error messages
- **Testing**: Comprehensive unit and E2E test coverage
- **CORS**: Configured for frontend integration (localhost:5173)

## Development Notes

- Database file: `database.sqlite` (auto-created)
- Swagger UI: Available at `/api` endpoint
- Global validation: Automatically strips unknown properties from requests
