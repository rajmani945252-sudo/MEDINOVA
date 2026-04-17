export const demoDoctors = [
  {
    id: 'demo-doctor-1',
    name: 'Dr. Priya Sharma',
    specialization: 'Cardiologist',
    experience: 12,
    fees: 800,
    location: 'Mumbai',
    bio: 'Focuses on preventive heart care, hypertension, and long-term cardiac follow-up.',
    phone: '+91 98765 11001',
    email: 'priya.sharma@medinova.demo',
  },
  {
    id: 'demo-doctor-2',
    name: 'Dr. Aamir Khan',
    specialization: 'Dermatologist',
    experience: 9,
    fees: 650,
    location: 'Delhi',
    bio: 'Specializes in acne care, skin allergies, and chronic dermatology treatment plans.',
    phone: '+91 98765 11002',
    email: 'aamir.khan@medinova.demo',
  },
  {
    id: 'demo-doctor-3',
    name: 'Dr. Neha Verma',
    specialization: 'Pediatrician',
    experience: 11,
    fees: 700,
    location: 'Bengaluru',
    bio: 'Supports child wellness visits, nutrition counseling, and seasonal illness management.',
    phone: '+91 98765 11003',
    email: 'neha.verma@medinova.demo',
  },
  {
    id: 'demo-doctor-4',
    name: 'Dr. Rahul Iyer',
    specialization: 'Orthopedic Surgeon',
    experience: 15,
    fees: 950,
    location: 'Chennai',
    bio: 'Treats sports injuries, joint pain, and post-surgery rehabilitation planning.',
    phone: '+91 98765 11004',
    email: 'rahul.iyer@medinova.demo',
  },
  {
    id: 'demo-doctor-5',
    name: 'Dr. Sana Qureshi',
    specialization: 'Gynecologist',
    experience: 10,
    fees: 780,
    location: 'Hyderabad',
    bio: 'Provides women’s health consultations, prenatal guidance, and hormonal care support.',
    phone: '+91 98765 11005',
    email: 'sana.qureshi@medinova.demo',
  },
  {
    id: 'demo-doctor-6',
    name: 'Dr. Vikram Singh',
    specialization: 'General Physician',
    experience: 8,
    fees: 500,
    location: 'Pune',
    bio: 'Handles everyday consultations, chronic condition reviews, and coordinated follow-ups.',
    phone: '+91 98765 11006',
    email: 'vikram.singh@medinova.demo',
  },
]

export const demoAppointmentRequests = [
  {
    id: 'demo-appointment-1',
    patient_id: 'demo-patient-1',
    patient_name: 'Aarav Mehta',
    patient_phone: '+91 98111 22001',
    patient_email: 'aarav.mehta@medinova.demo',
    date: '2026-04-18',
    time_slot: '10:00',
    status: 'pending',
    notes: 'Diabetes follow-up and medication review.',
  },
  {
    id: 'demo-appointment-2',
    patient_id: 'demo-patient-2',
    patient_name: 'Priya Nair',
    patient_phone: '+91 98111 22002',
    patient_email: 'priya.nair@medinova.demo',
    date: '2026-04-18',
    time_slot: '11:30',
    status: 'confirmed',
    notes: 'Asthma review with inhaler effectiveness check.',
  },
  {
    id: 'demo-appointment-3',
    patient_id: 'demo-patient-3',
    patient_name: 'Rohan Das',
    patient_phone: '+91 98111 22003',
    patient_email: 'rohan.das@medinova.demo',
    date: '2026-04-19',
    time_slot: '14:00',
    status: 'confirmed',
    notes: 'Blood pressure consultation and lifestyle guidance.',
  },
  {
    id: 'demo-appointment-4',
    patient_id: 'demo-patient-4',
    patient_name: 'Meera Kapoor',
    patient_phone: '+91 98111 22004',
    patient_email: 'meera.kapoor@medinova.demo',
    date: '2026-04-19',
    time_slot: '16:15',
    status: 'pending',
    notes: 'Migraine symptoms review and treatment options.',
  },
]

export const demoMedicines = [
  {
    id: 'demo-medicine-1',
    name: 'Paracetamol',
    category: 'Painkiller',
    price: 30,
    stock: 120,
    unit: 'tablets',
    description: 'Fast relief for fever and mild pain.',
  },
  {
    id: 'demo-medicine-2',
    name: 'Crocin',
    category: 'Painkiller',
    price: 45,
    stock: 80,
    unit: 'tablets',
    description: 'Common fever and body pain tablet.',
  },
  {
    id: 'demo-medicine-3',
    name: 'Dolo 650',
    category: 'Painkiller',
    price: 35,
    stock: 64,
    unit: 'tablets',
    description: '650 mg paracetamol tablet for fever support.',
  },
  {
    id: 'demo-medicine-4',
    name: 'Vitamin C',
    category: 'Vitamin',
    price: 90,
    stock: 42,
    unit: 'tablets',
    description: 'Daily immune support supplement.',
  },
]

export const demoPatientRecords = {
  'demo-appointment-1': {
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    conditions: ['Type 2 Diabetes', 'Mild Hypertension'],
    medications: ['Metformin 500 mg', 'Amlodipine 5 mg'],
    visits: [
      { date: '12 Mar 2026', note: 'Blood sugar improved. Continue medicines and diet plan.' },
      { date: '10 Jan 2026', note: 'Adjusted medication after elevated fasting sugar levels.' },
    ],
  },
  'demo-appointment-2': {
    bloodGroup: 'O+',
    allergies: 'Dust and pollen',
    conditions: ['Asthma'],
    medications: ['Salbutamol inhaler', 'Fluticasone inhaler'],
    visits: [
      { date: '03 Apr 2026', note: 'Symptoms stable. Continue inhaler routine.' },
      { date: '18 Feb 2026', note: 'Shortness of breath reduced after medication review.' },
    ],
  },
  'demo-appointment-3': {
    bloodGroup: 'A+',
    allergies: 'None',
    conditions: ['Hypertension'],
    medications: ['Telmisartan 40 mg'],
    visits: [
      { date: '27 Mar 2026', note: 'Blood pressure improved with regular medicine adherence.' },
    ],
  },
  'demo-appointment-4': {
    bloodGroup: 'AB-',
    allergies: 'Sulfa drugs',
    conditions: ['Migraine'],
    medications: ['Sumatriptan as needed'],
    visits: [
      { date: '01 Apr 2026', note: 'Frequency reduced after sleep and hydration changes.' },
    ],
  },
}

function cloneItems(items) {
  return items.map((item) => ({ ...item }))
}

export function toArray(value) {
  return Array.isArray(value) ? value : []
}

export function withFallbackItems(items, fallbackItems) {
  const safeItems = toArray(items).filter(Boolean)

  if (safeItems.length > 0) {
    return { items: safeItems, isDemo: false }
  }

  return { items: cloneItems(fallbackItems), isDemo: true }
}

export function filterDoctorsDirectory(doctors, query = '') {
  const searchText = String(query || '').trim().toLowerCase()

  if (!searchText) return doctors

  return doctors.filter((doctor) =>
    [doctor.name, doctor.specialization, doctor.location]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchText))
  )
}

export function getPatientRecordByAppointmentId(appointmentId) {
  return demoPatientRecords[appointmentId] || {
    bloodGroup: 'Not shared',
    allergies: 'None reported',
    conditions: ['General follow-up'],
    medications: ['Medication details unavailable'],
    visits: [{ date: 'Recent visit', note: 'Detailed history is not available for this consultation yet.' }],
  }
}
