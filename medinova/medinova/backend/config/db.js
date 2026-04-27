const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');

require('dotenv').config();

const DEFAULT_DB_NAME = 'medinova';
const databaseName = process.env.DB_NAME || DEFAULT_DB_NAME;
const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT || 3306),
};

const db = mysql.createPool({
  ...baseConfig,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

function escapeIdentifier(value) {
  return String(value).replace(/`/g, '``');
}

async function ensureDatabase() {
  const bootstrap = await mysqlPromise.createConnection(baseConfig);

  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${escapeIdentifier(databaseName)}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrap.end().catch(() => {});
  }
}

async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('patient', 'doctor', 'store', 'mr', 'admin') NOT NULL DEFAULT 'patient',
      phone VARCHAR(20) NULL,
      is_verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS doctor_profiles (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      specialization VARCHAR(120) NOT NULL DEFAULT 'General Physician',
      experience VARCHAR(80) NULL,
      fees DECIMAL(10,2) NOT NULL DEFAULT 0,
      location VARCHAR(160) NULL,
      bio TEXT NULL,
      available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_doctor_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS doctor_availability (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL UNIQUE,
      schedule LONGTEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_doctor_availability_user FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      date DATE NOT NULL,
      time_slot VARCHAR(50) NOT NULL,
      notes TEXT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS prescriptions (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      appointment_id INT NULL,
      doctor_id INT NOT NULL,
      patient_id INT NOT NULL,
      diagnosis VARCHAR(255) NULL,
      medicines LONGTEXT NOT NULL,
      instructions TEXT NULL,
      notes TEXT NULL,
      follow_up_date DATE NULL,
      tests_recommended TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_prescriptions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS medicines (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(120) NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      unit VARCHAR(40) NOT NULL DEFAULT 'tablets',
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_medicines_store FOREIGN KEY (store_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS medicine_orders (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      medicine_id INT NOT NULL,
      patient_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_medicine_orders_store FOREIGN KEY (store_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_medicine_orders_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      CONSTRAINT fk_medicine_orders_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS mr_products (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      mr_id INT NOT NULL,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(120) NULL,
      description TEXT NULL,
      dosage VARCHAR(120) NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_mr_products_user FOREIGN KEY (mr_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS mr_meetings (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      mr_id INT NOT NULL,
      doctor_id INT NOT NULL,
      title VARCHAR(160) NOT NULL,
      message TEXT NULL,
      meeting_date DATE NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_mr_meetings_mr FOREIGN KEY (mr_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_mr_meetings_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS health_records (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL UNIQUE,
      dob DATE NULL,
      gender VARCHAR(20) NULL,
      blood_group VARCHAR(10) NULL,
      height DECIMAL(6,2) NULL,
      weight DECIMAL(6,2) NULL,
      allergies TEXT NULL,
      conditions TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_health_records_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS medicine_reminders (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      medicine VARCHAR(160) NOT NULL,
      time_morning VARCHAR(20) NULL,
      time_afternoon VARCHAR(20) NULL,
      time_night VARCHAR(20) NULL,
      notes TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_medicine_reminders_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS medical_reports (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      name VARCHAR(160) NOT NULL,
      type VARCHAR(120) NULL,
      url VARCHAR(500) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_medical_reports_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const statement of statements) {
    await db.promise().query(statement);
  }
}

let initializationPromise = null;

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await ensureDatabase();
      await db.promise().query('SELECT 1');
      await ensureSchema();
      console.log(`MySQL connected successfully to "${databaseName}"`);
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

module.exports = db;
module.exports.initializeDatabase = initializeDatabase;
