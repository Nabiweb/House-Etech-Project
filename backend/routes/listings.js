const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

function sanitizeText(value) {
  return String(value || '').trim().replace(/<[^>]*>/g, '');
}

function validateListingPayload(payload, required = true) {
  const errors = [];
  const title = sanitizeText(payload.title);
  const description = sanitizeText(payload.description);
  const image = sanitizeText(payload.image);
  const priceValue = payload.price;
  const price = Number(priceValue);

  if (required || payload.title !== undefined) {
    if (!title) {
      errors.push('Title is required.');
    }
  }

  if (required || payload.description !== undefined) {
    if (!description) {
      errors.push('Description is required.');
    }
  }

  if (required || payload.image !== undefined) {
    if (!image) {
      errors.push('Image URL is required.');
    } else if (!/^https?:\/\/.+\..+/i.test(image)) {
      errors.push('Image URL must be valid.');
    }
  }

  if (required || payload.price !== undefined) {
    if (!Number.isFinite(price) || price <= 0) {
      errors.push('Price must be a positive number.');
    }
  }

  return {
    errors,
    listing: {
      title,
      description,
      image,
      price: Number.isFinite(price) ? price : undefined
    }
  };
}

function createObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const listings = await db.collection('listings').find().toArray();
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    const msg = process.env.NODE_ENV === 'production' ? 'Unable to load listings' : error.message;
    res.status(500).json({ error: msg });
  }
});

router.get('/:id', async (req, res) => {
  const listingId = createObjectId(req.params.id);
  if (!listingId) {
    return res.status(400).json({ error: 'Invalid listing id.' });
  }

  try {
    const db = req.app.locals.db;
    const listing = await db.collection('listings').findOne({ _id: listingId });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    const msg = process.env.NODE_ENV === 'production' ? 'Unable to load listing.' : error.message;
    res.status(500).json({ error: msg });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { errors, listing } = validateListingPayload(req.body, true);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const db = req.app.locals.db;
    const result = await db.collection('listings').insertOne(listing);
    res.status(201).json({ ...listing, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating listing:', error);
    const msg = process.env.NODE_ENV === 'production' ? 'Unable to create listing.' : error.message;
    res.status(500).json({ error: msg });
  }
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const listingId = createObjectId(req.params.id);
  if (!listingId) {
    return res.status(400).json({ error: 'Invalid listing id.' });
  }

  const { errors, listing } = validateListingPayload(req.body, false);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  if (!Object.keys(req.body).length) {
    return res.status(400).json({ error: 'No update data provided.' });
  }

  try {
    const db = req.app.locals.db;
    const existing = await db.collection('listings').findOne({ _id: listingId });
    if (!existing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const updated = {
      ...existing,
      ...Object.entries(listing).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {})
    };

    await db.collection('listings').updateOne({ _id: listingId }, { $set: updated });
    res.json(updated);
  } catch (error) {
    console.error('Error updating listing:', error);
    const msg = process.env.NODE_ENV === 'production' ? 'Unable to update listing.' : error.message;
    res.status(500).json({ error: msg });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const listingId = createObjectId(req.params.id);
  if (!listingId) {
    return res.status(400).json({ error: 'Invalid listing id.' });
  }

  try {
    const db = req.app.locals.db;
    const result = await db.collection('listings').deleteOne({ _id: listingId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting listing:', error);
    const msg = process.env.NODE_ENV === 'production' ? 'Unable to delete listing.' : error.message;
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
