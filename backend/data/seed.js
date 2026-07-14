const { MongoClient } = require('mongodb');
const seedData = require('./seedData');
require('dotenv').config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/house-etech';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const listings = db.collection('listings');

    await listings.deleteMany({});
    await listings.insertMany(seedData);

    console.log('Seed data inserted successfully');
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
