const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const storeRoutes = require('./routes/storeRoutes');
const mrRoutes = require('./routes/mrRoutes');
const adminRoutes = require('./routes/adminRoutes');
const smartRoutes = require('./routes/smartRoutes');

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: ['https://medinova-ckdc.vercel.app'],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.options('*', cors());

// middleware
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/mr', mrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smart', smartRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Medinova Backend Running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});