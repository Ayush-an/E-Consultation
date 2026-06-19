import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';
import GenericAdminPage from '../pages/GenericAdminPage';

const Overview = lazy(() => import('../pages/Dashboard/Overview'));
const RealTimeMonitoring = lazy(() => import('../pages/Dashboard/RealTimeMonitoring'));
const ActivityFeed = lazy(() => import('../pages/Dashboard/ActivityFeed'));
const UserManagement = lazy(() => import('../pages/Users/UserManagement'));
const DoctorManagement = lazy(() => import('../pages/Doctors/DoctorManagement'));
const ClinicManagement = lazy(() => import('../pages/Clinics/ClinicManagement'));
const ConsultationManagement = lazy(() => import('../pages/Consultations/ConsultationManagement'));
const AppointmentManagement = lazy(() => import('../pages/Consultations/AppointmentManagement'));
const RevenueDashboard = lazy(() => import('../pages/Revenue/RevenueDashboard'));
const GeneralSettings = lazy(() => import('../pages/Settings/GeneralSettings'));
const AuditLogs = lazy(() => import('../pages/Audit/AuditLogs'));
const RoleManagement = lazy(() => import('../pages/Roles/RoleManagement'));
const ReportGeneration = lazy(() => import('../pages/Reports/ReportGeneration'));
const EHRRecords = lazy(() => import('../pages/EHR/EHRRecords'));
const AnalyticsPage = lazy(() => import('../pages/Analytics/AnalyticsPage'));

const P = ({ title, description }) => <GenericAdminPage title={title} description={description} />;

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="monitoring" element={<RealTimeMonitoring />} />
        <Route path="activity" element={<ActivityFeed />} />

        <Route path="users" element={<UserManagement title="All Users" />} />
        <Route path="users/patients" element={<UserManagement title="Patients" roleFilter="PATIENT" />} />
        <Route path="users/doctors" element={<UserManagement title="Doctors" roleFilter="DOCTOR" />} />
        <Route path="users/clinic-admins" element={<UserManagement title="Clinic Admins" roleFilter="ADMIN" />} />
        <Route path="users/receptionists" element={<P title="Receptionists" description="Manage receptionist accounts and clinic front-desk access." />} />
        <Route path="users/staff" element={<P title="Staff Members" description="Manage support and operational staff accounts." />} />
        <Route path="users/blocked" element={<UserManagement title="Blocked Users" statusFilter="BLOCKED" />} />

        <Route path="clinics" element={<ClinicManagement title="All Clinics" />} />
        <Route path="clinics/pending" element={<ClinicManagement title="Pending Clinics" statusFilter="PENDING" />} />
        <Route path="clinics/approved" element={<ClinicManagement title="Approved Clinics" statusFilter="APPROVED" />} />
        <Route path="clinics/suspended" element={<ClinicManagement title="Suspended Clinics" statusFilter="SUSPENDED" />} />
        <Route path="clinics/performance" element={<AnalyticsPage title="Clinic Performance" chartKey="clinicGrowth" />} />

        <Route path="doctors" element={<DoctorManagement title="All Doctors" />} />
        <Route path="doctors/verification" element={<DoctorManagement title="Verification Requests" statusFilter="PENDING" />} />
        <Route path="doctors/active" element={<DoctorManagement title="Active Doctors" statusFilter="ACTIVE" />} />
        <Route path="doctors/suspended" element={<DoctorManagement title="Suspended Doctors" statusFilter="SUSPENDED" />} />
        <Route path="doctors/specializations" element={<P title="Specializations" description="Manage medical specializations and categories." />} />

        <Route path="consultations" element={<ConsultationManagement title="All Consultations" />} />
        <Route path="consultations/ongoing" element={<ConsultationManagement title="Ongoing Consultations" statusFilter="ongoing" />} />
        <Route path="consultations/completed" element={<ConsultationManagement title="Completed Consultations" statusFilter="completed" />} />
        <Route path="consultations/cancelled" element={<ConsultationManagement title="Cancelled Consultations" statusFilter="cancelled" />} />

        <Route path="appointments/upcoming" element={<AppointmentManagement title="Upcoming Appointments" statusFilter="upcoming" />} />
        <Route path="appointments/completed" element={<AppointmentManagement title="Completed Appointments" statusFilter="completed" />} />
        <Route path="appointments/cancelled" element={<AppointmentManagement title="Cancelled Appointments" statusFilter="cancelled" />} />
        <Route path="appointments/rescheduled" element={<AppointmentManagement title="Rescheduled Appointments" statusFilter="rescheduled" />} />

        <Route path="ehr/records" element={<EHRRecords />} />
        <Route path="ehr/prescriptions" element={<P title="Prescriptions" description="View and manage prescriptions issued across consultations." />} />
        <Route path="ehr/reports" element={<P title="Medical Reports" description="Lab reports and diagnostic documents." />} />
        <Route path="ehr/documents" element={<P title="Uploaded Documents" description="Patient-uploaded medical documents." />} />

        <Route path="revenue" element={<RevenueDashboard />} />
        <Route path="finance/transactions" element={<P title="Transactions" description="All payment transactions across the platform." />} />
        <Route path="finance/refunds" element={<P title="Refunds" description="Refund requests and processing." />} />
        <Route path="finance/commissions" element={<P title="Commissions" description="Platform commission tracking and payouts." />} />
        <Route path="finance/subscriptions" element={<P title="Subscription Plans" description="Manage clinic and doctor subscription tiers." />} />

        <Route path="analytics/users" element={<AnalyticsPage title="User Analytics" chartKey="userGrowth" pieKey="userDistribution" />} />
        <Route path="analytics/clinics" element={<AnalyticsPage title="Clinic Analytics" chartKey="clinicGrowth" />} />
        <Route path="analytics/doctors" element={<AnalyticsPage title="Doctor Analytics" chartKey="doctorRegistration" />} />
        <Route path="analytics/consultations" element={<AnalyticsPage title="Consultation Analytics" chartKey="consultationTrend" pieKey="consultationDistribution" />} />
        <Route path="analytics/revenue" element={<AnalyticsPage title="Revenue Analytics" chartKey="revenueTrend" pieKey="revenueDistribution" />} />

        <Route path="content/blogs" element={<P title="Blogs" />} />
        <Route path="content/articles" element={<P title="Articles" />} />
        <Route path="content/announcements" element={<P title="Announcements" />} />
        <Route path="content/banners" element={<P title="Banners" />} />

        <Route path="support/tickets" element={<P title="Support Tickets" description="Manage customer support tickets." />} />
        <Route path="support/complaints" element={<P title="Complaints" />} />
        <Route path="support/feedback" element={<P title="Feedback" />} />
        <Route path="support/contacts" element={<P title="Contact Requests" />} />

        <Route path="audit/login-logs" element={<AuditLogs />} />
        <Route path="audit/activity" element={<AuditLogs />} />
        <Route path="audit/failed-logins" element={<AuditLogs />} />
        <Route path="audit/security" element={<AuditLogs />} />

        <Route path="system/roles" element={<RoleManagement />} />
        <Route path="system/permissions" element={<RoleManagement />} />
        <Route path="system/api" element={<P title="API Monitoring" description="Monitor API endpoints, latency, and error rates." />} />
        <Route path="system/server" element={<RealTimeMonitoring />} />
        <Route path="system/database" element={<P title="Database Monitoring" description="Database performance and query analytics." />} />

        <Route path="settings" element={<GeneralSettings />} />
        <Route path="settings/email" element={<GeneralSettings />} />
        <Route path="settings/sms" element={<GeneralSettings />} />
        <Route path="settings/payment" element={<GeneralSettings />} />
        <Route path="settings/notifications" element={<GeneralSettings />} />

        <Route path="reports" element={<ReportGeneration />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
