# Deployment Guide

## Production architecture

```text
Vercel (React + TypeScript) -> Render (Express + Prisma) -> Neon (PostgreSQL)
```

## 1. Create the Neon database

1. Create a Neon PostgreSQL project and database.
2. Copy its pooled connection string, including `?sslmode=require`.
3. Keep this value private; it is the `DATABASE_URL` used only by the Render backend.

## 2. Deploy the backend to Render

1. Push this repository to GitHub and create a Render **Web Service** from it.
2. Render can use the root [render.yaml](../render.yaml). It sets `backend` as the root directory, runs Prisma client generation and the TypeScript build, then applies production migrations on start.
3. Add these environment values in the Render dashboard:

```env
DATABASE_URL=production_database_url
JWT_SECRET=production_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
PORT=10000
```

4. After deployment, open `https://your-backend.onrender.com/health`. It must respond with status `200`.

## 3. Deploy the frontend to Vercel

1. Import the same Git repository into Vercel.
2. Set **Root Directory** to `frontend` and Framework Preset to **Vite**.
3. Use build command `npm run build` and output directory `dist`.
4. Add this production environment variable before deploying:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

5. Redeploy after adding the variable. `frontend/vercel.json` ensures direct navigation to React routes works.

## 4. Complete the CORS connection

Copy the final Vercel deployment URL into Render as `FRONTEND_URL`, then redeploy Render. The API only accepts browser requests from that configured origin.

## Local development

Copy each `.env.example` file to `.env`, fill in a local PostgreSQL `DATABASE_URL`, then run:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

To load the documented local demo accounts and dashboard data, run `npm run prisma:seed` from `backend`. It clears the configured development database before inserting data; never run it against production.

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

## Production checklist

- Do not commit `.env` files, database credentials, JWT secrets, or real API keys.
- Use a strong, unique `JWT_SECRET`.
- Confirm `/health` works before pointing Vercel at the API.
- Set `FRONTEND_URL` to the exact Vercel domain (without a trailing slash).
- Run the Postman collection against the deployed API, including the insufficient-stock test.
