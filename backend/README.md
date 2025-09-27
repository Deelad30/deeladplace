# Deelad Place SaaS Backend

Backend API for Deelad Place SaaS application.

## Setup Instructions

1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/vendors` - Get all vendors
- `POST /api/sales` - Create a new sale
- `GET /api/inventory/movements` - Get inventory movements

## Database

Uses PostgreSQL with the following main tables:
- users, vendors, products, sales, expenses, inventory_movements