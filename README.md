# House Etech Project

A full-stack real estate web app with a separated frontend and backend.

- Frontend: Next.js
- Backend: Node.js + Express
- Database: MongoDB

## Project structure

- `frontend/` - Next.js application for the website UI
- `backend/` - Express API server with MongoDB data access

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm
- MongoDB running locally or a remote MongoDB connection

### Backend setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd "c:\Users\Nabi Mondal\Downloads\House Etech project\backend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` if it does not already exist:
   ```bash
   copy .env.example .env
   ```
4. Update `.env` if needed. The default values are:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/house-etech
   ```
5. Seed sample property data:
   ```bash
   node data/seed.js
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```

The backend API will run at `http://localhost:4000`.

### Frontend setup

1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd "c:\Users\Nabi Mondal\Downloads\House Etech project\frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend dev server:
   ```bash
   npm run dev
   ```

The frontend app will run at `http://localhost:3000`.

### Working with the app

- Frontend URL: `http://localhost:3000`
- Backend API health: `http://localhost:4000`
- Listings endpoint: `http://localhost:4000/api/listings`
- Listing detail endpoint: `http://localhost:4000/api/listings/:id`
- Create listing: `POST http://localhost:4000/api/listings`
- Update listing: `PUT http://localhost:4000/api/listings/:id`
- Delete listing: `DELETE http://localhost:4000/api/listings/:id`
- Contact endpoint: `http://localhost:4000/api/contact`

### Admin management page

- Visit `http://localhost:3000/manage` to create, edit, and delete property listings.
- This page uses the same backend CRUD endpoints and performs validation before submission.

### Seed data

The backend includes a seed script that inserts sample real estate listings into MongoDB.

- `backend/data/seed.js` - inserts sample listings into the `listings` collection
- `backend/data/seedData.js` - sample property objects

### Notes

- The frontend uses Next.js rewrites to proxy `/api/*` requests to the backend.
- The backend stores contact form submissions in the `contacts` collection.
- Keep `.env` out of source control; it contains environment-specific configuration.

## Folder details

### Frontend

- `pages/index.js` - home page and contact form
- `pages/_app.js` - global layout wrapper
- `components/Layout.js` - shared page layout
- `styles/globals.css` - application-wide CSS
- `styles/Home.module.css` - home page styling
- `next.config.js` - proxy rewrite to backend API

### Backend

- `index.js` - Express server bootstrap and MongoDB connection
- `routes/listings.js` - property listing API route
- `routes/contact.js` - contact form submission API route
- `data/seed.js` - seed script for sample data
- `data/seedData.js` - seed objects for listings

## Troubleshooting

- If the frontend fails to load API data, ensure the backend is running on port `4000`.
- If MongoDB fails to connect, verify `MONGODB_URI` in `backend/.env`.
- If the backend cannot start, ensure the `.env` file exists and `PORT` is set.
