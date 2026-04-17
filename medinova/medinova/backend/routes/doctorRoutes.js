const express = require('express');
const router  = express.Router();
const { getAllDoctors, searchDoctors } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const db = require('../config/db');
const { getAvailability, updateAvailability } = require('../controllers/availabilityController');

router.get('/',       protect, getAllDoctors);
router.get('/search', protect, searchDoctors);
router.get('/availability', protect, getAvailability);
router.put('/availability', protect, updateAvailability);
router.get('/profile', protect, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM doctor_profiles WHERE user_id=?', [user_id]
    );
    res.status(200).json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  const user_id = req.user.id;
  const { name, phone, specialization, experience, fees, location, bio, available } = req.body;
  try {
    await db.promise().query(
      'UPDATE users SET name=?, phone=? WHERE id=?',
      [name, phone, user_id]
    );
    const [existing] = await db.promise().query(
      'SELECT id FROM doctor_profiles WHERE user_id=?', [user_id]
    );
    if (existing.length > 0) {
      await db.promise().query(
        `UPDATE doctor_profiles SET specialization=?,experience=?,fees=?,location=?,bio=?,available=?
         WHERE user_id=?`,
        [specialization, experience, fees, location, bio, available, user_id]
      );
    } else {
      await db.promise().query(
        `INSERT INTO doctor_profiles (user_id,specialization,experience,fees,location,bio,available)
         VALUES (?,?,?,?,?,?,?)`,
        [user_id, specialization, experience, fees, location, bio, available]
      );
    }
    res.status(200).json({ message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;