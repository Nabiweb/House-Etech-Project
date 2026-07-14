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
const uri = process.env.MONGODB_URI;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

app.use(cors());
app.use(express.json());
app.use(requireDatabase);

app.get('/', (req, res) => {
  res.send({ message: 'House Etech API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/contact', contactRouter);

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function connectToDatabase() {
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
  connectToDatabase()
    .then(({ db }) => {
      req.app.locals.db = db;
      next();
    })
    .catch(next);
}

app.use(requireDatabase);

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

module.exports.handler = serverless(app);
