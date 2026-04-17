import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar             from './components/Navbar'
import ProtectedRoute     from './components/ProtectedRoute'
import Home               from './pages/Home'
import Login              from './pages/Login'
import Register           from './pages/Register'
import NotFound           from './pages/NotFound'
import PatientDashboard   from './pages/patient/PatientDashboard'
import SearchDoctors      from './pages/patient/SearchDoctors'
import MyAppointments     from './pages/patient/MyAppointments'
import BookAppointment    from './pages/patient/BookAppointment'
import MyPrescriptions    from './pages/patient/MyPrescriptions'
import PatientProfile     from './pages/patient/PatientProfile'
import PatientVideoConsultation from './pages/patient/PatientVideoConsultation'
import DoctorDashboard    from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import WritePrescription  from './pages/doctor/WritePrescription'
import DoctorMRMeetings   from './pages/doctor/DoctorMRMeetings'
import DoctorProfile      from './pages/doctor/DoctorProfile'
import StoreDashboard     from './pages/store/StoreDashboard'
import MedicineInventory  from './pages/store/MedicineInventory'
import StoreOrders        from './pages/store/StoreOrders'
import MRDashboard        from './pages/mr/MRDashboard'
import MRFindDoctor       from './pages/mr/MRFindDoctor'
import MRProducts         from './pages/mr/MRProducts'
import MRMeetings         from './pages/mr/MRMeetings'
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminUsers         from './pages/admin/AdminUsers'
import AdminAppointments  from './pages/admin/AdminAppointments'
import SymptomChecker     from './pages/smart/SymptomChecker'
import MedicineReminders  from './pages/smart/MedicineReminders'
import HealthCard         from './pages/smart/HealthCard'
import DoctorAvailability      from './pages/doctor/DoctorAvailability'
import PatientMedicalHistory   from './pages/doctor/PatientMedicalHistory'
import VideoConsultation       from './pages/doctor/VideoConsultation'
import PatientReportAnalysis   from './pages/doctor/PatientReportAnalysis'
function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
    </BrowserRouter>
  )
}

export default App
