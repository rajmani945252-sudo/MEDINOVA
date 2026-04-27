const db = require('../config/db');

function normalizeMedicineEntries(medicines) {
  if (Array.isArray(medicines)) {
    return medicines
      .map((medicine) => ({
        name: String(medicine?.name || '').trim(),
        dosage: String(medicine?.dosage || '').trim(),
        frequency: String(medicine?.frequency || '').trim(),
        duration: String(medicine?.duration || '').trim(),
        instructions: String(medicine?.instructions || '').trim(),
      }))
      .filter((medicine) => medicine.name);
  }

  return String(medicines || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      name: line,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    }));
}

function buildMedicineSummary(medicines) {
  return medicines
    .map((medicine) => {
      const details = [medicine.dosage, medicine.frequency, medicine.duration]
        .filter(Boolean)
        .join(', ');

      return details ? `${medicine.name} - ${details}` : medicine.name;
    })
    .join('\n');
}

function buildInstructionSummary(medicines, notes) {
  const medicationInstructions = medicines
    .filter((medicine) => medicine.instructions)
    .map((medicine) => `${medicine.name}: ${medicine.instructions}`);

  if (notes) {
    medicationInstructions.push(notes);
  }

  return medicationInstructions.join('\n').trim();
}

function parseStoredMedicines(rawValue) {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? normalizeMedicineEntries(parsed) : normalizeMedicineEntries(rawValue);
  } catch {
    return normalizeMedicineEntries(rawValue);
  }
}

const writePrescription = async (req, res) => {
  const {
    appointment_id,
    patient_id,
    diagnosis,
    medicines,
    notes,
    follow_up_date,
    tests_recommended,
  } = req.body;
  const doctor_id = req.user.id;

  try {
    const normalizedMedicines = normalizeMedicineEntries(medicines);

    if (!appointment_id) {
      return res.status(400).json({ message: 'Appointment id is required' });
    }

    if (normalizedMedicines.length === 0) {
      return res.status(400).json({ message: 'At least one medicine is required' });
    }

    const [appointments] = await db.promise().query(
      'SELECT id, patient_id FROM appointments WHERE id = ? AND doctor_id = ? LIMIT 1',
      [appointment_id, doctor_id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found for this doctor' });
    }

    const resolvedPatientId = patient_id || appointments[0].patient_id;
    const medicineSummary = buildMedicineSummary(normalizedMedicines);
    const instructionSummary = buildInstructionSummary(normalizedMedicines, notes);

    await db.promise().query(
      `INSERT INTO prescriptions
       (appointment_id, doctor_id, patient_id, diagnosis, medicines, instructions, notes, follow_up_date, tests_recommended)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        appointment_id,
        doctor_id,
        resolvedPatientId,
        diagnosis || null,
        JSON.stringify(normalizedMedicines),
        instructionSummary || null,
        notes || null,
        follow_up_date || null,
        tests_recommended || null,
      ]
    );

    await db.promise().query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['completed', appointment_id]
    );

    return res.status(201).json({
      message: 'Prescription written!',
      prescription: {
        appointment_id,
        patient_id: resolvedPatientId,
        diagnosis: diagnosis || '',
        medicines: medicineSummary,
        structured_medicines: normalizedMedicines,
        instructions: instructionSummary || '',
        notes: notes || '',
        follow_up_date: follow_up_date || null,
        tests_recommended: tests_recommended || '',
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyPrescriptions = async (req, res) => {
  const patient_id = req.user.id;

  try {
    const [rows] = await db.promise().query(`
      SELECT p.id, p.medicines, p.instructions, p.notes, p.created_at,
             u.name AS doctor_name,
             COALESCE(d.specialization, 'General Physician') AS specialization
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      LEFT JOIN doctor_profiles d ON u.id = d.user_id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
    `, [patient_id]);

    return res.status(200).json(
      rows.map((row) => {
        const structuredMedicines = parseStoredMedicines(row.medicines);
        const instructions = row.instructions || row.notes || '';

        return {
          ...row,
          medicines: buildMedicineSummary(structuredMedicines),
          structured_medicines: structuredMedicines,
          instructions,
        };
      })
    );
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  const doctor_id = req.user.id;
  const { patientId } = req.params;

  try {
    const [rows] = await db.promise().query(`
      SELECT id, diagnosis, medicines, instructions, notes, follow_up_date, tests_recommended, created_at
      FROM prescriptions
      WHERE doctor_id = ? AND patient_id = ?
      ORDER BY created_at DESC
    `, [doctor_id, patientId]);

    return res.status(200).json(
      rows.map((row) => ({
        ...row,
        medicines: parseStoredMedicines(row.medicines),
      }))
    );
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { writePrescription, getMyPrescriptions, getPatientPrescriptions };
