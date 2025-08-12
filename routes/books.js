const express = require('express');
const router = express.Router();
const pool = require('../db');
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, quantity = 0, available = 0, cover = null } = req.body;
    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, quantity, available, cover) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, quantity, available, cover]
    );
    res.json({ message: 'Book added', id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
