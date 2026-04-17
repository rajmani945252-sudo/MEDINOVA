const db = require('../config/db');

const symptomSpecializationMap = {
  'chest pain':        'Cardiologist',
  'heart':             'Cardiologist',
  'palpitation':       'Cardiologist',
  'skin':              'Dermatologist',
  'rash':              'Dermatologist',
  'acne':              'Dermatologist',
  'itching':           'Dermatologist',
  'eye':               'Ophthalmologist',
  'vision':            'Ophthalmologist',
  'ear':               'ENT Specialist',
  'throat':            'ENT Specialist',
  'nose':              'ENT Specialist',
  'cold':              'ENT Specialist',
  'teeth':             'Dentist',
  'tooth':             'Dentist',
  'gum':               'Dentist',
  'bone':              'Orthopedic',
  'joint':             'Orthopedic',
  'back pain':         'Orthopedic',
  'fracture':          'Orthopedic',
  'fever':             'General Physician',
  'cough':             'General Physician',
  'headache':          'General Physician',
  'fatigue':           'General Physician',
  'stomach':           'Gastroenterologist',
  'digestion':         'Gastroenterologist',
  'vomiting':          'Gastroenterologist',
  'diabetes':          'Endocrinologist',
  'thyroid':           'Endocrinologist',
  'sugar':             'Endocrinologist',
  'kidney':            'Nephrologist',
  'urine':             'Nephrologist',
  'brain':             'Neurologist',
  'memory':            'Neurologist',
  'anxiety':           'Psychiatrist',
  'depression':        'Psychiatrist',
  'mental':            'Psychiatrist',
  'child':             'Pediatrician',
  'baby':              'Pediatrician',
  'pregnancy':         'Gynecologist',
  'period':            'Gynecologist',
  'lung':              'Pulmonologist',
  'breathing':         'Pulmonologist',
  'asthma':            'Pulmonologist',
};

const checkSymptoms = async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ message: 'Please enter symptoms' });

  const lower = symptoms.toLowerCase();
  const found = new Set();

  for (const [keyword, spec] of Object.entries(symptomSpecializationMap)) {
    if (lower.includes(keyword)) found.add(spec);
  }

  const suggestions = found.size > 0
    ? [...found]
    : ['General Physician'];

  try {
    const placeholders = suggestions.map(() => '?').join(',');
    const [doctors] = await db.promise().query(`
      SELECT u.id, u.name, u.phone,
             d.specialization, d.experience, d.fees, d.location
      FROM users u
      JOIN doctor_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      AND d.specialization IN (${placeholders})
    `, suggestions);

    res.status(200).json({ suggestions, doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getHealthTips = (req, res) => {
  const tips = [
    { icon: '💧', title: 'Stay Hydrated',       tip: 'Drink at least 8 glasses of water daily to keep your body functioning properly.' },
    { icon: '🏃', title: 'Exercise Daily',       tip: '30 minutes of moderate exercise daily reduces risk of heart disease by 35%.' },
    { icon: '😴', title: 'Sleep Well',           tip: 'Adults need 7-9 hours of sleep. Poor sleep increases risk of obesity and diabetes.' },
    { icon: '🥗', title: 'Eat Balanced Meals',  tip: 'Include fruits, vegetables, whole grains, and lean proteins in every meal.' },
    { icon: '🧘', title: 'Manage Stress',        tip: 'Chronic stress affects heart health. Practice meditation or deep breathing daily.' },
    { icon: '🚭', title: 'Quit Smoking',         tip: 'Smoking causes 1 in 5 deaths annually. Quitting adds years to your life.' },
    { icon: '🦷', title: 'Oral Hygiene',         tip: 'Brush twice daily and floss once. Poor oral health is linked to heart disease.' },
    { icon: '☀️', title: 'Get Sunlight',         tip: '15-20 minutes of sunlight daily boosts Vitamin D and improves mood.' },
    { icon: '🩺', title: 'Regular Checkups',     tip: 'Annual health checkups catch problems early when they are easiest to treat.' },
    { icon: '🧴', title: 'Wash Your Hands',      tip: 'Proper handwashing for 20 seconds prevents 80% of common infections.' },
  ];

  const today = new Date().getDay();
  const dailyTips = [tips[today], tips[(today + 1) % tips.length], tips[(today + 2) % tips.length]];
  res.status(200).json(dailyTips);
};

const getHealthCard = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const [users] = await db.promise().query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id=?',
      [patient_id]
    );
    const [records] = await db.promise().query(
      'SELECT * FROM health_records WHERE patient_id=?',
      [patient_id]
    );
    const [[apptCount]] = await db.promise().query(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id=?',
      [patient_id]
    );
    res.status(200).json({
      user:         users[0],
      healthRecord: records[0] || null,
      totalAppointments: apptCount.count,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const saveHealthRecord = async (req, res) => {
  const patient_id = req.user.id;
  const { blood_group, height, weight, allergies, conditions } = req.body;
  try {
    const [existing] = await db.promise().query(
      'SELECT id FROM health_records WHERE patient_id=?', [patient_id]
    );
    if (existing.length > 0) {
      await db.promise().query(
        `UPDATE health_records SET blood_group=?,height=?,weight=?,allergies=?,conditions=?
         WHERE patient_id=?`,
        [blood_group, height, weight, allergies, conditions, patient_id]
      );
    } else {
      await db.promise().query(
        `INSERT INTO health_records (patient_id,blood_group,height,weight,allergies,conditions)
         VALUES (?,?,?,?,?,?)`,
        [patient_id, blood_group, height, weight, allergies, conditions]
      );
    }
    res.status(200).json({ message: 'Health record saved!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getReminders = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM medicine_reminders WHERE patient_id=? AND is_active=1 ORDER BY created_at DESC',
      [patient_id]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addReminder = async (req, res) => {
  const patient_id = req.user.id;
  const { medicine, time_morning, time_afternoon, time_night, notes } = req.body;
  try {
    await db.promise().query(
      `INSERT INTO medicine_reminders
       (patient_id,medicine,time_morning,time_afternoon,time_night,notes)
       VALUES (?,?,?,?,?,?)`,
      [patient_id, medicine, time_morning, time_afternoon, time_night, notes]
    );
    res.status(201).json({ message: 'Reminder added!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteReminder = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query(
      'UPDATE medicine_reminders SET is_active=0 WHERE id=?', [id]
    );
    res.status(200).json({ message: 'Reminder removed!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  checkSymptoms, getHealthTips,
  getHealthCard, saveHealthRecord,
  getReminders, addReminder, deleteReminder,
};