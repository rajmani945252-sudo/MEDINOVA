const db = require('../config/db');

const getPatientReports = async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await db.promise().query(
      'SELECT id, name, type, url, created_at FROM medical_reports WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPatientReports };
