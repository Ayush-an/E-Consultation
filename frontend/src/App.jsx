import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import MainLayout from './layouts/MainLayout';
import PatientLayout from './layouts/PatientLayout';
import DoctorCornerLayout from './layouts/DoctorCornerLayout';
import { Skeleton } from './components/Skeleton';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const RoleSelect = lazy(() => import('./pages/login/RoleSelect'));
const PatientForm = lazy(() => import('./pages/patient/PatientForm'));
const PatientRegistration = lazy(() => import('./pages/login/PatientRegistration'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientBooking = lazy(() => import('./pages/patient/PatientBooking'));
const PatientMedicalRecords = lazy(() => import('./pages/patient/PatientMedicalRecords'));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions'));
const PatientLogin = lazy(() => import('./pages/login/PatientLogin'));
const DoctorLogin = lazy(() => import('./pages/login/DoctorLogin'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorSchedule = lazy(() => import('./pages/doctor/DoctorSchedule'));
const DoctorScheduleHistory = lazy(() => import('./pages/doctor/DoctorScheduleHistory'));
const Consultation = lazy(() => import('./pages/doctor/Consultation'));
const PDR = lazy(() => import('./pages/patient/PDR'));
const DoctorLanding = lazy(() => import('./pages/doctorcorner/DoctorLanding'));
const DoctorCornerLogin = lazy(() => import('./pages/doctorcorner/DoctorCornerLogin'));
const DoctorCornerRegistration = lazy(() => import('./pages/doctorcorner/DoctorCornerRegistration'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface-50">
    <div className="w-full max-w-md p-8 text-center">
      <Skeleton circle width="4rem" height="4rem" className="mx-auto mb-6" />
      <Skeleton width="60%" className="mx-auto mb-4" />
      <Skeleton width="40%" className="mx-auto" />
    </div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Pages with Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/patient-registration" element={<PatientRegistration />} />
            <Route path="/pdr" element={<PDR />} />
            <Route path="/patient-login" element={<PatientLogin />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
          </Route>

          {/* Doctor Corner — Own Navbar */}
          <Route element={<DoctorCornerLayout />}>
            <Route path="/doctor-corner" element={<DoctorLanding />} />
            <Route path="/doctor-corner/login" element={<DoctorCornerLogin />} />
            <Route path="/doctor-corner/register" element={<DoctorCornerRegistration />} />
          </Route>

          <Route element={<PatientLayout />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient-booking" element={<PatientBooking />} />
            <Route path="/medical-records" element={<PatientMedicalRecords />} />
            <Route path="/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient-form" element={<PatientForm />} />
          </Route>

          {/* Pages without Navbar (full-screen layouts) */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/consultations" element={<DoctorDashboard />} />
          <Route path="/doctor/prescriptions" element={<DoctorDashboard />} />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/doctor/schedule-history" element={<DoctorScheduleHistory />} />
          <Route path="/doctor/profile" element={<DoctorDashboard />} />
          <Route path="/consultation" element={<Consultation />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
