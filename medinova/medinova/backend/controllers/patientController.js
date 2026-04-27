const db = require('../config/db');

const getPatientById = async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone, u.created_at,
             h.dob, h.gender, h.blood_group, h.height, h.weight,
             h.allergies, h.conditions AS chronic_conditions
      FROM users u
      LEFT JOIN health_records h ON u.id = h.patient_id
      WHERE u.id = ? AND u.role = 'patient'
      LIMIT 1
    `, [patientId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPatientById };
