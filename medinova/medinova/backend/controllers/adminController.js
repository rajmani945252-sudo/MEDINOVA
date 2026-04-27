const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[patients]]     = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role='patient'");
    const [[doctors]]      = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role='doctor'");
    const [[stores]]       = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role='store'");
    const [[mrs]]          = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role='mr'");
    const [[appointments]] = await db.promise().query("SELECT COUNT(*) as count FROM appointments");
    const [[prescriptions]]= await db.promise().query("SELECT COUNT(*) as count FROM prescriptions");
    const [[medicines]]    = await db.promise().query("SELECT COUNT(*) as count FROM medicines");

    res.status(200).json({
      patients:      patients.count,
      doctors:       doctors.count,
      stores:        stores.count,
      mrs:           mrs.count,
      appointments:  appointments.count,
      prescriptions: prescriptions.count,
      medicines:     medicines.count,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id, name, email, role, phone, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (Number(id) === Number(req.user?.id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const verifyUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query('UPDATE users SET is_verified = 1 WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User verified!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.id, a.date, a.time_slot, a.status, a.created_at,
             p.name AS patient_name,
             d.name AS doctor_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id  = d.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  verifyUser,
  getAllAppointments,
};
