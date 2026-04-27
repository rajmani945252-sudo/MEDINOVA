import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar             from './components/Navbar'
import ProtectedRoute     from './components/ProtectedRoute'
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'))
const SearchDoctors = lazy(() => import('./pages/patient/SearchDoctors'))
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'))
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'))
const MyPrescriptions = lazy(() => import('./pages/patient/MyPrescriptions'))
const PatientProfile = lazy(() => import('./pages/patient/PatientProfile'))
const PatientVideoConsultation = lazy(() => import('./pages/patient/PatientVideoConsultation'))
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'))
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'))
const WritePrescription = lazy(() => import('./pages/doctor/WritePrescription'))
const DoctorMRMeetings = lazy(() => import('./pages/doctor/DoctorMRMeetings'))
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'))
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'))
const MedicineInventory = lazy(() => import('./pages/store/MedicineInventory'))
const StoreOrders = lazy(() => import('./pages/store/StoreOrders'))
const MRDashboard = lazy(() => import('./pages/mr/MRDashboard'))
const MRFindDoctor = lazy(() => import('./pages/mr/MRFindDoctor'))
const MRProducts = lazy(() => import('./pages/mr/MRProducts'))
const MRMeetings = lazy(() => import('./pages/mr/MRMeetings'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'))
const SymptomChecker = lazy(() => import('./pages/smart/SymptomChecker'))
const MedicineReminders = lazy(() => import('./pages/smart/MedicineReminders'))
const HealthCard = lazy(() => import('./pages/smart/HealthCard'))
const DoctorAvailability = lazy(() => import('./pages/doctor/DoctorAvailability'))
const PatientMedicalHistory = lazy(() => import('./pages/doctor/PatientMedicalHistory'))
const VideoConsultation = lazy(() => import('./pages/doctor/VideoConsultation'))
const PatientReportAnalysis = lazy(() => import('./pages/doctor/PatientReportAnalysis'))

function RouteFallback() {
  return (
    <div className="page">
      <div className="page-content">
        <div className="portal-note">Loading page...</div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/patient/dashboard" element={
            <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/search" element={
            <ProtectedRoute role="patient"><SearchDoctors /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={
            <ProtectedRoute role="patient"><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/video-consultation/:appointmentId" element={
            <ProtectedRoute role="patient"><PatientVideoConsultation /></ProtectedRoute>} />
          <Route path="/patient/book/:id" element={
            <ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={
            <ProtectedRoute role="patient"><MyPrescriptions /></ProtectedRoute>} />
          <Route path="/patient/profile" element={
            <ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/symptoms" element={
            <ProtectedRoute role="patient"><SymptomChecker /></ProtectedRoute>} />
          <Route path="/patient/reminders" element={
            <ProtectedRoute role="patient"><MedicineReminders /></ProtectedRoute>} />
          <Route path="/patient/health-card" element={
            <ProtectedRoute role="patient"><HealthCard /></ProtectedRoute>} />

          <Route path="/doctor/dashboard" element={
            <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:id" element={
            <ProtectedRoute role="doctor"><WritePrescription /></ProtectedRoute>} />
          <Route path="/doctor/mr-meetings" element={
            <ProtectedRoute role="doctor"><DoctorMRMeetings /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={
            <ProtectedRoute role="doctor"><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={
            <ProtectedRoute role="doctor"><DoctorAvailability /></ProtectedRoute>} />
          <Route path="/doctor/patient/:patientId/history" element={
            <ProtectedRoute role="doctor"><PatientMedicalHistory /></ProtectedRoute>} />
          <Route path="/doctor/video-consultation" element={
            <ProtectedRoute role="doctor"><VideoConsultation /></ProtectedRoute>} />
          <Route path="/doctor/patient-report-analysis" element={
            <ProtectedRoute role="doctor"><PatientReportAnalysis /></ProtectedRoute>} />

          <Route path="/store/dashboard" element={
            <ProtectedRoute role="store"><StoreDashboard /></ProtectedRoute>} />
          <Route path="/store/medicines" element={
            <ProtectedRoute role="store"><MedicineInventory /></ProtectedRoute>} />
          <Route path="/store/orders" element={
            <ProtectedRoute role="store"><StoreOrders /></ProtectedRoute>} />

          <Route path="/mr/dashboard" element={
            <ProtectedRoute role="mr"><MRDashboard /></ProtectedRoute>} />
          <Route path="/mr/find-doctors" element={
            <ProtectedRoute role="mr"><MRFindDoctor /></ProtectedRoute>} />
          <Route path="/mr/products" element={
            <ProtectedRoute role="mr"><MRProducts /></ProtectedRoute>} />
          <Route path="/mr/meetings" element={
            <ProtectedRoute role="mr"><MRMeetings /></ProtectedRoute>} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={
            <ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
