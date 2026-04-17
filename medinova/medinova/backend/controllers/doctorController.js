const db = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone,
             d.specialization, d.experience,
             d.fees, d.location, d.bio, d.available
      FROM users u
      JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
    `);
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const searchDoctors = async (req, res) => {
  const { query } = req.query;
  try {
    const [doctors] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone,
             d.specialization, d.experience,
             d.fees, d.location, d.bio, d.available
      FROM users u
      JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      AND (u.name LIKE ? OR d.specialization LIKE ? OR d.location LIKE ?)
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllDoctors, searchDoctors };