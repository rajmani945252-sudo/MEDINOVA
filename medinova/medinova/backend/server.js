const express = require('express');
const cors = require('cors');

require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const storeRoutes = require('./routes/storeRoutes');
const mrRoutes = require('./routes/mrRoutes');
const adminRoutes = require('./routes/adminRoutes');
const smartRoutes = require('./routes/smartRoutes');
const patientRoutes = require('./routes/patientRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getAllowedOrigins() {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
    'https://medinova-ckdc.vercel.app',
  ];
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(
    [...defaultOrigins, process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL, ...envOrigins]
      .map(normalizeOrigin)
      .filter(Boolean)
  );
}

const allowedOrigins = getAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Medinova Backend Running!',
    database: db.isReady() ? 'connected' : 'initializing',
  });
});

app.get('/api/health', (req, res) => {
  const ready = db.isReady();

  return res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'degraded',
    service: 'medinova-backend',
    database: db.getStatus(),
  });
});

app.use((req, res, next) => {
  if (db.isReady()) {
    return next();
  }

  return res.status(503).json({
    message: 'Service is starting up. Database connection is not ready yet.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/mr', mrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smart', smartRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);

app.use((error, req, res, next) => {
  if (error?.message?.startsWith('Origin not allowed by CORS')) {
    return res.status(403).json({ message: error.message });
  }

  return next(error);
});

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 5000);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bootstrapDatabase() {
  while (!db.isReady()) {
    try {
      await db.initializeDatabase();
      return;
    } catch (error) {
      console.error('Database initialization failed:', error.message);
      console.log(`Retrying database connection in ${DB_RETRY_DELAY_MS}ms...`);
      await wait(DB_RETRY_DELAY_MS);
    }
  }
}

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

bootstrapDatabase().catch((error) => {
  console.error('Unexpected database bootstrap failure:', error.message);
});
