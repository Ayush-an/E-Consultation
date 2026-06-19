import {
  FiGrid, FiActivity, FiList, FiUsers, FiUserCheck, FiUserX, FiHome,
  FiCheckCircle, FiClock, FiPauseCircle, FiTrendingUp, FiUser,
  FiShield, FiLayers, FiVideo, FiCheck, FiX, FiRefreshCw,
  FiFileText, FiClipboard, FiUpload, FiDollarSign, FiCreditCard,
  FiRotateCcw, FiPercent, FiPackage, FiBarChart2, FiPieChart,
  FiBook, FiBell, FiImage, FiHeadphones, FiMessageSquare, FiMail,
  FiLock, FiAlertTriangle, FiServer, FiDatabase, FiKey, FiMonitor,
  FiSettings, FiLogOut, FiCalendar,
} from 'react-icons/fi';

export const adminMenuSections = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Overview', path: '/admin', icon: FiGrid, end: true },
      { name: 'Real Time Monitoring', path: '/admin/monitoring', icon: FiActivity },
      { name: 'Activity Feed', path: '/admin/activity', icon: FiList },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        name: 'User Management',
        icon: FiUsers,
        children: [
          { name: 'All Users', path: '/admin/users' },
          { name: 'Patients', path: '/admin/users/patients' },
          { name: 'Doctors', path: '/admin/users/doctors' },
          { name: 'Clinic Admins', path: '/admin/users/clinic-admins' },
          { name: 'Receptionists', path: '/admin/users/receptionists' },
          { name: 'Staff Members', path: '/admin/users/staff' },
          { name: 'Blocked Users', path: '/admin/users/blocked' },
        ],
      },
      {
        name: 'Clinic Management',
        icon: FiHome,
        children: [
          { name: 'All Clinics', path: '/admin/clinics' },
          { name: 'Pending Clinics', path: '/admin/clinics/pending' },
          { name: 'Approved Clinics', path: '/admin/clinics/approved' },
          { name: 'Suspended Clinics', path: '/admin/clinics/suspended' },
          { name: 'Clinic Performance', path: '/admin/clinics/performance' },
        ],
      },
      {
        name: 'Doctor Management',
        icon: FiUserCheck,
        children: [
          { name: 'All Doctors', path: '/admin/doctors' },
          { name: 'Verification Requests', path: '/admin/doctors/verification' },
          { name: 'Active Doctors', path: '/admin/doctors/active' },
          { name: 'Suspended Doctors', path: '/admin/doctors/suspended' },
          { name: 'Specializations', path: '/admin/doctors/specializations' },
        ],
      },
      {
        name: 'Consultation Management',
        icon: FiVideo,
        children: [
          { name: 'All Consultations', path: '/admin/consultations' },
          { name: 'Ongoing', path: '/admin/consultations/ongoing' },
          { name: 'Completed', path: '/admin/consultations/completed' },
          { name: 'Cancelled', path: '/admin/consultations/cancelled' },
        ],
      },
      {
        name: 'Appointment Management',
        icon: FiCalendar,
        children: [
          { name: 'Upcoming', path: '/admin/appointments/upcoming' },
          { name: 'Completed', path: '/admin/appointments/completed' },
          { name: 'Cancelled', path: '/admin/appointments/cancelled' },
          { name: 'Rescheduled', path: '/admin/appointments/rescheduled' },
        ],
      },
      {
        name: 'EHR Management',
        icon: FiFileText,
        children: [
          { name: 'Medical Records', path: '/admin/ehr/records' },
          { name: 'Prescriptions', path: '/admin/ehr/prescriptions' },
          { name: 'Reports', path: '/admin/ehr/reports' },
          { name: 'Uploaded Documents', path: '/admin/ehr/documents' },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        name: 'Financial Management',
        icon: FiDollarSign,
        children: [
          { name: 'Revenue', path: '/admin/revenue' },
          { name: 'Transactions', path: '/admin/finance/transactions' },
          { name: 'Refunds', path: '/admin/finance/refunds' },
          { name: 'Commissions', path: '/admin/finance/commissions' },
          { name: 'Subscription Plans', path: '/admin/finance/subscriptions' },
        ],
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        name: 'Analytics',
        icon: FiBarChart2,
        children: [
          { name: 'User Analytics', path: '/admin/analytics/users' },
          { name: 'Clinic Analytics', path: '/admin/analytics/clinics' },
          { name: 'Doctor Analytics', path: '/admin/analytics/doctors' },
          { name: 'Consultation Analytics', path: '/admin/analytics/consultations' },
          { name: 'Revenue Analytics', path: '/admin/analytics/revenue' },
        ],
      },
      {
        name: 'Content Management',
        icon: FiBook,
        children: [
          { name: 'Blogs', path: '/admin/content/blogs' },
          { name: 'Articles', path: '/admin/content/articles' },
          { name: 'Announcements', path: '/admin/content/announcements' },
          { name: 'Banners', path: '/admin/content/banners' },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        name: 'Support',
        icon: FiHeadphones,
        children: [
          { name: 'Tickets', path: '/admin/support/tickets' },
          { name: 'Complaints', path: '/admin/support/complaints' },
          { name: 'Feedback', path: '/admin/support/feedback' },
          { name: 'Contact Requests', path: '/admin/support/contacts' },
        ],
      },
      {
        name: 'Audit & Security',
        icon: FiShield,
        children: [
          { name: 'Login Logs', path: '/admin/audit/login-logs' },
          { name: 'Activity Logs', path: '/admin/audit/activity' },
          { name: 'Failed Login Attempts', path: '/admin/audit/failed-logins' },
          { name: 'Security Events', path: '/admin/audit/security' },
        ],
      },
      {
        name: 'System Management',
        icon: FiServer,
        children: [
          { name: 'Roles', path: '/admin/system/roles' },
          { name: 'Permissions', path: '/admin/system/permissions' },
          { name: 'API Monitoring', path: '/admin/system/api' },
          { name: 'Server Monitoring', path: '/admin/system/server' },
          { name: 'Database Monitoring', path: '/admin/system/database' },
        ],
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        name: 'Settings',
        icon: FiSettings,
        children: [
          { name: 'General Settings', path: '/admin/settings' },
          { name: 'Email Settings', path: '/admin/settings/email' },
          { name: 'SMS Settings', path: '/admin/settings/sms' },
          { name: 'Payment Gateway', path: '/admin/settings/payment' },
          { name: 'Notification Settings', path: '/admin/settings/notifications' },
        ],
      },
      { name: 'Reports', path: '/admin/reports', icon: FiClipboard },
    ],
  },
];
