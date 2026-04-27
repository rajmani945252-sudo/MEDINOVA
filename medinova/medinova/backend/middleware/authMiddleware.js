const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medinova-dev-secret');
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not allowed to access this resource' });
  }

  return next();
};

module.exports = { protect, authorize };
