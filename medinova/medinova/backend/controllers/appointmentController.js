const db = require('../config/db');

const bookAppointment = async (req, res) => {
  const { doctor_id, date, time_slot, notes } = req.body;
  const patient_id = req.user.id;

  try {
    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({ message: 'Doctor, date, and time slot are required' });
    }

    await db.promise().query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, notes)
       VALUES (?,?,?,?,?)`,
      [patient_id, doctor_id, date, time_slot, notes]
    );

    return res.status(201).json({ message: 'Appointment booked!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  const patient_id = req.user.id;

  try {
    const [rows] = await db.promise().query(`
      SELECT a.id, a.date, a.time_slot, a.status, a.notes,
             u.name AS doctor_name,
             COALESCE(d.specialization, 'General Physician') AS specialization,
             COALESCE(d.fees, 0) AS fees
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.created_at DESC
    `, [patient_id]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
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

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPatientAppointments = async (req, res) => {
  const doctor_id = req.user.id;
  const { patientId } = req.params;

  try {
    const [rows] = await db.promise().query(`
      SELECT id, date, time_slot, status, notes AS reason, created_at
      FROM appointments
      WHERE doctor_id = ? AND patient_id = ?
      ORDER BY date DESC, created_at DESC
    `, [doctor_id, patientId]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.promise().query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    return res.status(200).json({ message: `Appointment ${status}` });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
};
