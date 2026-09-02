# AI-Powered Finance Analyzer Platform

A modern financial management platform that helps users track spending, classify transactions, forecast future cash flow, and interact with an AI-powered financial assistant. The project combines a FastAPI backend, PostgreSQL storage, Redis caching, and a Next.js dashboard to provide a complete personal finance workflow.

## Description

This application is designed for people who want a clearer view of their finances without manually reviewing every payment. Users can upload transaction CSV files, review categorized spending, see recurring patterns, and ask the AI assistant questions about budgets, merchant behavior, and recent financial activity.

The system is organized as a full-stack product:

- Backend: FastAPI-based API with authentication, transactional data handling, forecasting, and AI orchestration.
- Frontend: Next.js dashboard for authentication, account overview, transaction management, and analytics.
- Data layer: PostgreSQL for persistent financial records and Redis for supporting background services.
- AI services: OpenAI-backed insights for budgeting guidance and conversational finance analysis.

## Key Features

- CSV transaction ingestion and user-scoped financial records
- Automatic merchant/category classification for imported transactions
- User authentication and JWT-based session management
- Spending dashboard with totals, category summaries, and chart visualizations
- Predictive analytics and spending forecast generation
- AI finance assistant for user questions and account insights
- PostgreSQL-backed persistence with Alembic migrations
- Docker-based local setup for backend, frontend, Postgres, and Redis

## Screenshots

### Transaction Upload

Upload a bank statement CSV and review categorized transactions in the transaction workspace.

![Transaction upload screen](images/upload.png)

### Financial Dashboard

Review total spending, tracked transactions, category breakdowns, and expenditure charts.

![Financial analytics dashboard](images/dashboard.png)

## Architecture

- Frontend: Next.js app in the `frontend/` directory
- Backend: FastAPI service in the `backend/` directory
- Database: PostgreSQL via Docker Compose
- Cache: Redis for app support services
- AI layer: OpenAI integration through backend services

## Project Structure

```text
.
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── requirements.txt
├── README.md
├── test/
└── docs/
```

## Prerequisites

Before you start, make sure you have:

- Docker Desktop or Docker Engine with Compose support
- Node.js 20+
- Python 3.11+
- An OpenAI API key for AI-powered features

## Quick Start with Docker Compose

1. Clone the repository.
2. Create a root environment file named `.env` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET_KEY=change_this_secret
```

3. Start the full stack:

```bash
docker compose up --build
```

4. Access the apps:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5433
- Redis: localhost:6379

5. To stop the stack:

```bash
docker compose down
```

## Local Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` if you want to run the API outside Docker:

```bash
DATABASE_URL=postgresql+asyncpg://finance_admin:supersecretpassword@localhost:5433/finance_dev_db
REDIS_URL=redis://localhost:6379/0
PROJECT_NAME=Finance AI Platform
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET_KEY=change_this_secret
```

Then run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## API Notes

The backend exposes endpoints for:

- Authentication (`/api/v1/auth`)
- Transaction upload and retrieval (`/api/v1/transactions`)
- Forecasting (`/api/v1/analytics/forecast`)
- AI chat (`/api/v1/chat`)
- ML-related tooling (`/api/v1/ml`)

## Useful Commands

```bash
docker compose up --build
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
```

## License

This project is licensed under the terms in the repository license file.
