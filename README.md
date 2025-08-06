# Todo List Backend API

A NestJS-based REST API for todo list management with user authentication and JWT authorization.

## Docker Setup (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Running with Docker

```bash
# Clone and navigate to the project directory
cd todolist-backend

# Run with Docker Compose
docker compose --env-file ./.env.deploy up -d --force-recreate --build

# The API will be available at http://localhost:3000
```

### Environment Configuration
Copy `.env.deploy` and modify as needed. The default configuration should work for Docker setup.

## Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Setup database with Prisma
npx prisma generate
npx prisma migrate dev

# Start development server
npm run start:dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | `{ email, password, name? }` |
| `POST` | `/auth/login` | User login | `{ email, password }` |

### Todos (🔒 JWT Required)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/todos` | Get all todos | - |
| `POST` | `/todos` | Create new todo | `{ title, description?, completed? }` |
| `PUT` | `/todos/:id` | Update todo | `{ title?, description?, completed? }` |
| `DELETE` | `/todos/:id` | Delete todo | - |

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT
- **Language:** TypeScript

## Environment Variables

For Docker setup, see `.env.example` file with the following variables:

```env
# Database Configuration
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=tododb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_APP_USER=nathapat
POSTGRES_APP_PASSWORD=5678

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
NODE_ENV="production"
PORT=3000
```

For manual setup:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/todolist"
JWT_SECRET="your-jwt-secret"
```

## Docker Services

- **Backend**: NestJS API server (Port 3000)
- **Database**: PostgreSQL 17 (Port 5432)
- **Network**: `todo-network` for service communication
