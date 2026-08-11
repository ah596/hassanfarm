# Goat Farm Management & Profit Estimator

Full-stack farm management system for goats and sheep.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Auth: Firebase Authentication with JWT ID tokens
- Database: Firebase Firestore

## Features

- Login/register
- Animal management
- Expense tracking
- Feed tracking
- Medicine tracking
- Sales tracking
- Automatic profit/loss calculation
- Dashboard metrics
- Reports and filters

## Setup

1. Configure Firebase project
2. Copy `.env.example` files in `frontend/` and `backend/`
3. Install dependencies in each package
4. Run frontend and backend dev servers

## Notes

- Firebase ID tokens are JWTs, so the backend is protected with JWT-based auth.
- Calculations are always derived from stored records, not hard-coded values.
