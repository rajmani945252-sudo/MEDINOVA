const express = require('express');

const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const db = require('../config/db');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id, name, email, role, phone, is_verified, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  const { name, phone } = req.body;
  const id = req.user.id;

  try {
    await db.promise().query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [String(name || '').trim(), String(phone || '').trim(), id]
    );

    const [rows] = await db.promise().query(
      'SELECT id, name, email, role, phone, is_verified, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );

    return res.status(200).json({ message: 'Profile updated!', user: rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
