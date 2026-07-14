const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const listingsRouter = require('./routes/listings');
const contactRouter = require('./routes/contact');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message: 'House Etech API is running' });
});

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

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
