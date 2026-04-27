const db = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone,
             COALESCE(d.specialization, 'General Physician') AS specialization,
             COALESCE(d.experience, '') AS experience,
             COALESCE(d.fees, 0) AS fees,
             COALESCE(d.location, '') AS location,
             COALESCE(d.bio, '') AS bio,
             COALESCE(d.available, 1) AS available
      FROM users u
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
    `);

    return res.status(200).json(doctors);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const searchDoctors = async (req, res) => {
  const query = String(req.query?.query || '').trim();

  try {
    const [doctors] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone,
             COALESCE(d.specialization, 'General Physician') AS specialization,
             COALESCE(d.experience, '') AS experience,
             COALESCE(d.fees, 0) AS fees,
             COALESCE(d.location, '') AS location,
             COALESCE(d.bio, '') AS bio,
             COALESCE(d.available, 1) AS available
      FROM users u
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      AND (u.name LIKE ? OR COALESCE(d.specialization, '') LIKE ? OR COALESCE(d.location, '') LIKE ?)
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

    return res.status(200).json(doctors);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllDoctors, searchDoctors };
