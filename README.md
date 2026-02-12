# Product Pricing Portal

Production-ready internal web app for entering and managing retail/bulk prices for a cosmetics catalog.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB Atlas (Mongoose)
- Next.js API Routes
- XLSX export

## Environment Variables

Create `.env.local`:

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_USER=your_admin_username
ADMIN_PASS=your_admin_password
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Authentication

- Login page: `/login`
- Protected routes: `/pricing`, `/admin`, `/api/products/*`, `/api/export`
- Credentials are validated against `ADMIN_USER` and `ADMIN_PASS`.

## Routes

- `/pricing`: one-product-at-a-time mobile-first price entry with debounced autosave (500ms), progress bar, and Enter-to-save-next keyboard flow.
- `/admin`: searchable/filterable table, inline price edits, add/delete products, and export button.
- `/api/export`: downloads `.xlsx` with Product Name, Item Code, Retail Price, Bulk Price.

## Seed Initial Products

1. Set `MONGODB_URI` in environment.
2. Run:

```bash
npm run seed
```

This resets and inserts starter products into the `product-pricing-portal` database.

## MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas.
2. Add a database user with read/write access.
3. In Network Access, allow your IP (or `0.0.0.0/0` for quick setup, not recommended long term).
4. Copy the SRV connection string and set it as `MONGODB_URI`.

## Deploy to Vercel

1. Push project to GitHub.
2. In Vercel, import the repository.
3. Add environment variables in Project Settings:
   - `MONGODB_URI`
   - `ADMIN_USER`
   - `ADMIN_PASS`
4. Deploy.

Vercel will build the Next.js app and run the API routes serverlessly.

## Deploy to Netlify

1. Push project to GitHub.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select the repository and keep build settings as:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Site configuration:
   - `MONGODB_URI`
   - `ADMIN_USER`
   - `ADMIN_PASS`
5. Deploy.

Netlify will detect Next.js and run API routes/middleware on Netlify Functions automatically.
