const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const db = req.app.locals.db;
    const contact = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date()
    };

    await db.collection('contacts').insertOne(contact);
    res.status(201).json({ status: 'success' });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    res.status(500).json({ error: 'Unable to save contact submission.' });
  }
});

module.exports = router;
