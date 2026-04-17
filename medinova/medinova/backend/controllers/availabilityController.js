const db = require('../config/db');

const getAvailability = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT schedule FROM doctor_availability WHERE doctor_id = ?',
      [doctor_id]
    );
    if (rows.length === 0) return res.status(200).json({});
    const schedule = typeof rows[0].schedule === 'string'
      ? JSON.parse(rows[0].schedule)
      : rows[0].schedule;
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAvailability = async (req, res) => {
  const doctor_id = req.user.id;
  const schedule  = req.body;
  try {
    const [existing] = await db.promise().query(
      'SELECT id FROM doctor_availability WHERE doctor_id = ?',
      [doctor_id]
    );
    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO doctor_availability (doctor_id, schedule) VALUES (?, ?)',
        [doctor_id, JSON.stringify(schedule)]
      );
    } else {
      await db.promise().query(
        'UPDATE doctor_availability SET schedule = ? WHERE doctor_id = ?',
        [JSON.stringify(schedule), doctor_id]
      );
    }
    res.status(200).json({ message: 'Availability updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAvailability, updateAvailability };