const express = require('express');
const router = express.Router();
const pool = require('../db');
router.post('/issue', async (req, res) => {
  try {
    const { studentId, bookId, days = 14 } = req.body;
    const [[book]] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.available <= 0) return res.status(400).json({ error: 'No copies available' });
    const dueDate = new Date(Date.now() + days * 24*60*60*1000);
    const [result] = await pool.query(
      'INSERT INTO transactions (student_id, book_id, due_date, status) VALUES (?, ?, ?, ?)',
      [studentId, bookId, dueDate, 'issued']
    );
    await pool.query('UPDATE books SET available = available - 1 WHERE id = ?', [bookId]);
    res.json({ message: 'Book issued', transactionId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/return', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const [[tx]] = await pool.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status === 'returned') return res.status(400).json({ error: 'Already returned' });
    await pool.query('UPDATE transactions SET status = ?, return_date = ? WHERE id = ?', ['returned', new Date(), transactionId]);
    await pool.query('UPDATE books SET available = available + 1 WHERE id = ?', [tx.book_id]);
    res.json({ message: 'Book returned' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
