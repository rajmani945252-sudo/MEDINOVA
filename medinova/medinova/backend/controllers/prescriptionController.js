const db = require('../config/db');

const writePrescription = async (req, res) => {
  const { appointment_id, patient_id, medicines, instructions } = req.body;
  const doctor_id = req.user.id;
  try {
    await db.promise().query(
      `INSERT INTO prescriptions
       (appointment_id, doctor_id, patient_id, medicines, instructions)
       VALUES (?,?,?,?,?)`,
      [appointment_id, doctor_id, patient_id, medicines, instructions]
    );
    await db.promise().query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['completed', appointment_id]
    );
    res.status(201).json({ message: 'Prescription written!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyPrescriptions = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT p.id, p.medicines, p.instructions, p.created_at,
             u.name AS doctor_name,
             d.specialization
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN doctor_profiles d ON u.id = d.user_id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `, [patient_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { writePrescription, getMyPrescriptions };