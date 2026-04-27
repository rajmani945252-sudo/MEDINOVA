const db = require('../config/db');

const addProduct = async (req, res) => {
  const mr_id = req.user.id;
  const { name, category, description, dosage, price } = req.body;

  try {
    await db.promise().query(
      `INSERT INTO mr_products (mr_id, name, category, description, dosage, price)
       VALUES (?,?,?,?,?,?)`,
      [mr_id, name, category, description, dosage, price]
    );

    return res.status(201).json({ message: 'Product added!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyProducts = async (req, res) => {
  const mr_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM mr_products WHERE mr_id = ? ORDER BY created_at DESC',
      [mr_id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM mr_products WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Product deleted!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const requestMeeting = async (req, res) => {
  const mr_id = req.user.id;
  const { doctor_id, title, message, meeting_date } = req.body;

  try {
    await db.promise().query(
      `INSERT INTO mr_meetings (mr_id, doctor_id, title, message, meeting_date)
       VALUES (?,?,?,?,?)`,
      [mr_id, doctor_id, title, message, meeting_date]
    );

    return res.status(201).json({ message: 'Meeting request sent!' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyMeetings = async (req, res) => {
  const mr_id = req.user.id;

  try {
    const [rows] = await db.promise().query(`
      SELECT m.id, m.title, m.message, m.status,
             m.meeting_date, m.created_at,
             u.name AS doctor_name,
             COALESCE(d.specialization, 'General Physician') AS specialization
      FROM mr_meetings m
      JOIN users u ON m.doctor_id = u.id
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE m.mr_id = ?
      ORDER BY m.created_at DESC
    `, [mr_id]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDoctorMeetingRequests = async (req, res) => {
  const doctor_id = req.user.id;

  try {
    const [rows] = await db.promise().query(`
      SELECT m.id, m.title, m.message, m.status,
             m.meeting_date, m.created_at,
             u.name AS mr_name, u.phone AS mr_phone,
             u.email AS mr_email
      FROM mr_meetings m
      JOIN users u ON m.mr_id = u.id
      WHERE m.doctor_id = ?
      ORDER BY m.created_at DESC
    `, [doctor_id]);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateMeetingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.promise().query(
      'UPDATE mr_meetings SET status = ? WHERE id = ?',
      [status, id]
    );

    return res.status(200).json({ message: `Meeting ${status}` });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllDoctorsForMR = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.phone,
             COALESCE(d.specialization, 'General Physician') AS specialization,
             COALESCE(d.location, '') AS location
      FROM users u
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
    `);

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addProduct,
  getMyProducts,
  deleteProduct,
  requestMeeting,
  getMyMeetings,
  getDoctorMeetingRequests,
  updateMeetingStatus,
  getAllDoctorsForMR,
};
