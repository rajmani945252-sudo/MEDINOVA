const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const allowedRoles = new Set(['patient', 'doctor', 'store', 'mr', 'admin']);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    is_verified: Boolean(user.is_verified),
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'medinova-dev-secret',
    { expiresIn: '7d' }
  );
}

async function ensureDoctorProfile(userId) {
  await db.promise().query(
    `INSERT INTO doctor_profiles (user_id)
     VALUES (?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
    [userId]
  );
}

const register = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const role = allowedRoles.has(req.body?.role) ? req.body.role : 'patient';
  const phone = String(req.body?.phone || '').trim();

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,?,?)',
      [name, email, hashedPassword, role, phone]
    );

    if (role === 'doctor') {
      await ensureDoctorProfile(result.insertId);
    }

    const createdUser = {
      id: result.insertId,
      name,
      email,
      role,
      phone,
      is_verified: 0,
    };

    return res.status(201).json({
      message: 'Account created successfully!',
      token: signToken(createdUser),
      user: sanitizeUser(createdUser),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const storedPassword = String(user.password || '');
    let isMatch = false;

    if (
      storedPassword.startsWith('$2a$') ||
      storedPassword.startsWith('$2b$') ||
      storedPassword.startsWith('$2y$')
    ) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      isMatch = storedPassword === password;

      if (isMatch) {
        const upgradedHash = await bcrypt.hash(password, 10);
        await db.promise().query(
          'UPDATE users SET password = ? WHERE id = ?',
          [upgradedHash, user.id]
        );
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'doctor') {
      await ensureDoctorProfile(user.id);
    }

    return res.status(200).json({
      message: 'Login successful',
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };
