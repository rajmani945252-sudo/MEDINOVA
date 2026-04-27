const db = require('../config/db');

const allowedOrderStatuses = new Set(['pending', 'confirmed', 'delivered', 'cancelled']);

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeMedicinePayload(body = {}) {
  return {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    price: Number(body.price || 0),
    stock: Number(body.stock || 0),
    unit: String(body.unit || 'tablets').trim() || 'tablets',
    description: String(body.description || '').trim(),
  };
}

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

const addMedicine = async (req, res) => {
  const store_id = req.user.id;
  const { name, category, price, stock, unit, description } = normalizeMedicinePayload(req.body);

  try {
    if (!name) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: 'Price and stock cannot be negative' });
    }

    await db.promise().query(
      `INSERT INTO medicines (store_id, name, category, price, stock, unit, description)
       VALUES (?,?,?,?,?,?,?)`,
      [store_id, name, category || null, price, stock, unit, description || null]
    );

    res.status(201).json({ message: 'Medicine added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const store_id = req.user.id;
  const { name, price, stock, category, unit, description } = normalizeMedicinePayload(req.body);

  try {
    if (!name) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: 'Price and stock cannot be negative' });
    }

    const [result] = await db.promise().query(
      `UPDATE medicines
       SET name = ?, price = ?, stock = ?, category = ?, unit = ?, description = ?
       WHERE id = ? AND store_id = ?`,
      [name, price, stock, category || null, unit, description || null, id, store_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteMedicine = async (req, res) => {
  const { id } = req.params;
  const store_id = req.user.id;

  try {
    const [result] = await db.promise().query(
      'DELETE FROM medicines WHERE id = ? AND store_id = ?',
      [id, store_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
      SELECT m.*, u.name AS store_name
      FROM medicines m
      JOIN users u ON m.store_id = u.id
      WHERE m.stock > 0
      ORDER BY m.name ASC
    `
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStoreOrders = async (req, res) => {
  const store_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT o.id, o.quantity, o.status, o.created_at,
             m.name AS medicine_name, m.price,
             u.name AS patient_name, u.phone AS patient_phone
      FROM medicine_orders o
      JOIN medicines m ON o.medicine_id = m.id
      JOIN users u ON o.patient_id = u.id
      WHERE o.store_id = ?
      ORDER BY o.created_at DESC
    `,
      [store_id]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const store_id = req.user.id;
  const status = normalizeStatus(req.body?.status);

  try {
    if (!allowedOrderStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const [result] = await db.promise().query(
      'UPDATE medicine_orders SET status = ? WHERE id = ? AND store_id = ?',
      [status, id, store_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: `Order ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMyMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicines,
  getStoreOrders,
  updateOrderStatus,
};
