const express = require('express');
const router = express.Router();
const pool = require('../db');
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, regNumber, email, department } = req.body;
    const [result] = await pool.query(
      'INSERT INTO students (name, reg_number, email, department) VALUES (?, ?, ?, ?)',
      [name, regNumber, email, department]
    );
    res.json({ message: 'Student added', id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
