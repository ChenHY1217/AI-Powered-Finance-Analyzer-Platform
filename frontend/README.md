# Frontend Overview

This frontend provides the user-facing dashboard and experience for the AI-Powered Finance Analyzer Platform. It is built with Next.js and serves as the main interface for authentication, transaction review, spending analytics, and AI-powered financial assistance.

## Key Frontend Features

- Secure login and registration flow
- Dashboard overview with summary metrics
- Transaction list and category breakdowns
- Spending charts and visual analytics
- AI chat interface for finance questions
- Forecasting screens for future spending patterns
- API integration with the FastAPI backend

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Zustand for app state
- Axios for backend API calls

## Local Setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Environment Configuration

The frontend reads the backend URL from the environment variable `NEXT_PUBLIC_API_URL`.

Example:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If you are using Docker Compose, this is already configured in the project setup.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

The app expects the backend service to be running before using authenticated flows, transaction uploads, and analytics endpoints.
