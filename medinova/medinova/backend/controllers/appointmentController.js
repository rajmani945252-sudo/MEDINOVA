const db = require('../config/db');

const allowedAppointmentStatuses = new Set(['pending', 'confirmed', 'rejected', 'completed']);

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

const bookAppointment = async (req, res) => {
  const doctor_id = Number(req.body?.doctor_id);
  const date = String(req.body?.date || '').trim();
  const time_slot = String(req.body?.time_slot || '').trim();
  const notes = String(req.body?.notes || '').trim();
  const patient_id = req.user.id;

  try {
    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({ message: 'Doctor, date, and time slot are required' });
    }

    const [doctors] = await db.promise().query(
      "SELECT id FROM users WHERE id = ? AND role = 'doctor' LIMIT 1",
      [doctor_id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [existingAppointments] = await db.promise().query(
      `SELECT id
       FROM appointments
       WHERE patient_id = ? AND doctor_id = ? AND date = ? AND time_slot = ?
       AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [patient_id, doctor_id, date, time_slot]
    );

    if (existingAppointments.length > 0) {
      return res.status(409).json({ message: 'You already have an active appointment for this slot' });
    }

    await db.promise().query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, notes)
       VALUES (?,?,?,?,?)`,
      [patient_id, doctor_id, date, time_slot, notes || null]
    );

    return res.status(201).json({ message: 'Appointment booked!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  const patient_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT a.id, a.date, a.time_slot, a.status, a.notes,
             u.name AS doctor_name,
             COALESCE(d.specialization, 'General Physician') AS specialization,
             COALESCE(d.fees, 0) AS fees
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.created_at DESC
    `,
      [patient_id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  const doctor_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT a.id, a.date, a.time_slot, a.status, a.notes,
             u.name AS patient_name,
             u.phone AS patient_phone,
             u.email AS patient_email,
             u.id AS patient_id
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY a.date ASC, a.created_at DESC
    `,
      [doctor_id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPatientAppointments = async (req, res) => {
  const { patientId } = req.params;

  try {
    const isAdmin = req.user.role === 'admin';
    const sql = isAdmin
      ? `
        SELECT a.id, a.date, a.time_slot, a.status, a.notes AS reason, a.created_at,
               d.name AS doctor_name
        FROM appointments a
        JOIN users d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.date DESC, a.created_at DESC
      `
      : `
        SELECT id, date, time_slot, status, notes AS reason, created_at
        FROM appointments
        WHERE doctor_id = ? AND patient_id = ?
        ORDER BY date DESC, created_at DESC
      `;
    const params = isAdmin ? [patientId] : [req.user.id, patientId];
    const [rows] = await db.promise().query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const status = normalizeStatus(req.body?.status);

  try {
    if (!allowedAppointmentStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }

    const isAdmin = req.user.role === 'admin';
    const query = isAdmin
      ? 'UPDATE appointments SET status = ? WHERE id = ?'
      : 'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?';
    const params = isAdmin ? [status, id] : [status, id, req.user.id];
    const [result] = await db.promise().query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

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
