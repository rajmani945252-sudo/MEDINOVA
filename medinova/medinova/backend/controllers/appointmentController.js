const db = require('../config/db');

const bookAppointment = async (req, res) => {
  const { doctor_id, date, time_slot, notes } = req.body;
  const patient_id = req.user.id;
  try {
    await db.promise().query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, notes)
       VALUES (?,?,?,?,?)`,
      [patient_id, doctor_id, date, time_slot, notes]
    );
    res.status(201).json({ message: 'Appointment booked!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT a.id, a.date, a.time_slot, a.status, a.notes,
             u.name AS doctor_name,
             d.specialization, d.fees
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles d ON u.id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.created_at DESC
    `, [patient_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT a.id, a.date, a.time_slot, a.status, a.notes,
             u.name AS patient_name,
             u.phone AS patient_phone,
             u.email AS patient_email,
             u.id AS patient_id
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY a.date ASC
    `, [doctor_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;
  try {
    await db.promise().query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    res.status(200).json({ message: `Appointment ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
};