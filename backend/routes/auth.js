const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

function sanitizeText(value) {
  return String(value || '').trim().replace(/<[^>]*>/g, '');
}

function validateUserPayload({ email, password }) {
  const errors = [];
  const normalizedEmail = sanitizeText(email).toLowerCase();
  const normalizedPassword = String(password || '');

  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    errors.push('Email must be valid.');
  }

  if (normalizedPassword.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  return {
    errors,
    email: normalizedEmail,
    password: normalizedPassword
  };
}

router.post('/login', async (req, res) => {
  const db = req.app.locals.db;
  const { errors, email, password } = validateUserPayload(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Unable to login.' });
  }
});

router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { errors, email, password } = validateUserPayload(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      email,
      password: passwordHash,
      role: 'admin',
      createdAt: new Date()
    });

    const token = generateToken({ _id: result.insertedId, email, role: 'admin' });
    res.status(201).json({ token, email, role: 'admin' });
  } catch (error) {
    console.error('Register failed:', error);
    res.status(500).json({ error: 'Unable to register.' });
  }
});

module.exports = router;
