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

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'https://medinova-ckdc.vercel.app',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
  res.json({ message: 'Medinova Backend Running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'medinova-backend' });
});

app.use((error, req, res, next) => {
  if (error?.message?.startsWith('Origin not allowed by CORS')) {
    return res.status(403).json({ message: error.message });
  }
  return next(error);
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();