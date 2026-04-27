const express = require('express');

const { getAllDoctors, searchDoctors } = require('../controllers/doctorController');
const { getAvailability, updateAvailability } = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const db = require('../config/db');

const router = express.Router();

router.get('/', protect, getAllDoctors);
router.get('/search', protect, searchDoctors);
router.get('/availability', protect, authorize('doctor'), getAvailability);
router.put('/availability', protect, authorize('doctor'), updateAvailability);

router.get('/profile', protect, authorize('doctor'), async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM doctor_profiles WHERE user_id = ?',
      [user_id]
    );

    return res.status(200).json(rows[0] || {});
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/profile', protect, authorize('doctor'), async (req, res) => {
  const user_id = req.user.id;
  const name = String(req.body?.name || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const specialization = String(req.body?.specialization || '').trim();
  const experience = String(req.body?.experience || '').trim();
  const fees = Number(req.body?.fees || 0);
  const location = String(req.body?.location || '').trim();
  const bio = String(req.body?.bio || '').trim();
  const available = Boolean(req.body?.available);

  try {
    if (!name || !specialization) {
      return res.status(400).json({ message: 'Name and specialization are required' });
    }

    if (fees < 0) {
      return res.status(400).json({ message: 'Consultation fees cannot be negative' });
    }

    await db.promise().query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, user_id]
    );

    const [existing] = await db.promise().query(
      'SELECT id FROM doctor_profiles WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      await db.promise().query(
        `UPDATE doctor_profiles
         SET specialization = ?, experience = ?, fees = ?, location = ?, bio = ?, available = ?
         WHERE user_id = ?`,
        [specialization, experience, fees, location, bio, available, user_id]
      );
    } else {
      await db.promise().query(
        `INSERT INTO doctor_profiles (user_id, specialization, experience, fees, location, bio, available)
         VALUES (?,?,?,?,?,?,?)`,
        [user_id, specialization, experience, fees, location, bio, available]
      );
    }

    return res.status(200).json({ message: 'Profile updated!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
