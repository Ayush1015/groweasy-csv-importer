# GrowEasy AI-Powered CSV Importer

An AI-powered CSV importer built to ingest arbitrary CRM lead exports (Facebook, Real Estate CRMs, etc.) and map them intelligently to GrowEasy's fixed CRM schema using Anthropic's Claude.

## Architecture

```text
groweasy-csv-importer/
├── frontend/ (Next.js 14, Tailwind, Zustand)
│   └── UI for file upload, preview, processing status, and results.
├── backend/ (Node.js, Express, TypeScript)
│   └── API for CSV parsing, batched AI processing, and strict Zod validation.
├── sample-data/
│   └── Test CSV files.
└── docker-compose.yml
```

### Design Decisions
1. **Stateless Backend**: We avoid a database (like SQLite/PostgreSQL) to minimize deployment risk and keep the architecture simple, matching the assignment's requirement for a streamlined review.
2. **AI Provider Abstraction**: Using the `@anthropic-ai/sdk`, the core logic is encapsulated in `ai.service.ts`, making it swappable for another provider in the future.
3. **Concurrency & Resilience**: We use `p-limit` for processing batches of CSV rows concurrently (speed) and `p-retry` to retry on transient AI failures.
4. **Zod Validation**: Ensures the AI outputs always strictly adhere to the CRM enums and types, or correctly maps invalid enums to empty values.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- Anthropic API Key

### 2. Installation
Run from the root directory:
```bash
npm run install:all
```

### 3. Environment Variables
Backend (`backend/.env`):
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_key
BATCH_SIZE=20
CONCURRENCY_CAP=3
```

Frontend (`frontend/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Running Locally
Run the monorepo concurrently:
```bash
npm run dev
```
Access the frontend at `http://localhost:3000`.

## API Documentation

### `POST /api/import`
Accepts a `multipart/form-data` request with a `.csv` file.

**Response (Success)**:
```json
{
  "success": true,
  "totalProcessed": 42,
  "totalImported": 39,
  "totalSkipped": 3,
  "records": [ ... ],
  "skippedRecords": [
    { "row": { ... }, "reason": "No email or mobile number found" }
  ]
}
```

## Known Limitations
- The AI parsing handles a batch size of 20 to avoid token limits, but very large CSV files (> 1000 rows) might take a while. A background job (e.g., BullMQ) would be better for massive scale.
- No historical persistence, as the app is stateless.

## Live Demo
[Live Demo URL Placeholder]
[GitHub Repository Placeholder]
