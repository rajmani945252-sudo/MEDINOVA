const db = require('../config/db');

// Get all medicines for this store
const getMyMedicines = async (req, res) => {
  const store_id = req.user.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM medicines WHERE store_id = ? ORDER BY created_at DESC',
      [store_id]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add new medicine
const addMedicine = async (req, res) => {
  const store_id = req.user.id;
  const { name, category, price, stock, unit, description } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO medicines (store_id,name,category,price,stock,unit,description)
       VALUES (?,?,?,?,?,?,?)`,
      [store_id, name, category, price, stock, unit || 'tablets', description]
    );
    res.status(201).json({ message: 'Medicine added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update medicine stock
const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category, unit, description } = req.body;
  try {
    await db.promise().query(
      `UPDATE medicines SET name=?,price=?,stock=?,category=?,unit=?,description=?
       WHERE id=?`,
      [name, price, stock, category, unit, description, id]
    );
    res.status(200).json({ message: 'Medicine updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM medicines WHERE id=?', [id]);
    res.status(200).json({ message: 'Medicine deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all medicines (for patients to browse)
const getAllMedicines = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT m.*, u.name AS store_name
      FROM medicines m
      JOIN users u ON m.store_id = u.id
      WHERE m.stock > 0
      ORDER BY m.name ASC
    `);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get orders for store
const getStoreOrders = async (req, res) => {
  const store_id = req.user.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT o.id, o.quantity, o.status, o.created_at,
             m.name AS medicine_name, m.price,
             u.name AS patient_name, u.phone AS patient_phone
      FROM medicine_orders o
      JOIN medicines m ON o.medicine_id = m.id
      JOIN users u ON o.patient_id = u.id
      WHERE o.store_id = ?
      ORDER BY o.created_at DESC
    `, [store_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.promise().query(
      'UPDATE medicine_orders SET status=? WHERE id=?',
      [status, id]
    );
    res.status(200).json({ message: `Order ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMyMedicines, addMedicine, updateMedicine,
  deleteMedicine, getAllMedicines,
  getStoreOrders, updateOrderStatus
};