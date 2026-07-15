const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');
const listingsRouter = require('./routes/listings');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');
require('dotenv').config();

const app = express();
const uri = process.env.MONGODB_URI || '';
const adminEmail = process.env.ADMIN_EMAIL || '';
const adminPassword = process.env.ADMIN_PASSWORD || '';

app.use(cors());
app.use(express.json());
app.use(requireDatabase);

app.get('/', (req, res) => {
  res.send({ message: 'House Etech API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/debug-db', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const listingsCount = await db.collection('listings').countDocuments();
    res.json({ ok: true, listingsCount });
  } catch (err) {
    console.error('Debug DB error:', err);
    res.status(500).json({ ok: false, error: process.env.NODE_ENV === 'production' ? 'Database error' : err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/contact', contactRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled Express error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error.' });
});

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;
  global._mongoClient = client;
  global._mongoDb = db;

  if (adminEmail && adminPassword) {
    await seedAdminUser(db);
  }

  return { client, db };
}

function requireDatabase(req, res, next) {
  if (!uri) {
    console.error('MONGODB_URI is missing. Set the environment variable in Vercel.');
    return res.status(500).json({ error: 'Database configuration is missing.' });
  }

  connectToDatabase()
    .then(({ db }) => {
      req.app.locals.db = db;
      next();
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      res.status(500).json({ error: 'Unable to connect to database.' });
    });
}

async function seedAdminUser(db) {
  const normalizedEmail = adminEmail.toLowerCase();
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existing = await db.collection('users').findOne({ email: normalizedEmail });

  if (existing) {
    await db.collection('users').updateOne(
      { _id: existing._id },
      { $set: { password: passwordHash, role: 'admin' } }
    );
    console.log('Updated admin user credentials:', normalizedEmail);
    return;
  }

  await db.collection('users').insertOne({
    email: normalizedEmail,
    password: passwordHash,
    role: 'admin',
    createdAt: new Date()
  });

  console.log('Seeded admin user:', normalizedEmail);
}

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server listening on ${port}`));
}

const handler = serverless(app);
module.exports = handler;
module.exports.handler = handler;
