const express              = require('express');
const router               = express.Router();
const { register, login }  = require('../controllers/authController');
const { protect }          = require('../middleware/authMiddleware');
const db                   = require('../config/db');

router.post('/register', register);
router.post('/login',    login);

router.put('/profile', protect, async (req, res) => {
  const { name, phone } = req.body;
  const id = req.user.id;
  try {
    await db.promise().query(
      'UPDATE users SET name=?, phone=? WHERE id=?',
      [name, phone, id]
    );
    res.status(200).json({ message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;