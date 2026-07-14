const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const listings = await db.collection('listings').find().toArray();
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Unable to load listings' });
  }
});

module.exports = router;
