const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const listingsRouter = require('./routes/listings');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'House Etech API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/contact', contactRouter);

async function startServer() {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  app.locals.db = db;

  if (adminEmail && adminPassword) {
    await seedAdminUser(db);
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
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

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
