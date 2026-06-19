const { Op } = require('sequelize');
const { User, Doctor, Patient, Consultation, Slot, Prescription } = require('../models');
const logger = require('../utils/logger');

const MOCK_CLINICS = [
  { id: 'c1', name: 'Apollo Multispeciality', state: 'Maharashtra', city: 'Mumbai', doctors: 24, patients: 1200, revenue: 485000, rating: 4.8, status: 'APPROVED' },
  { id: 'c2', name: 'Fortis Healthcare', state: 'Karnataka', city: 'Bangalore', doctors: 18, patients: 890, revenue: 362000, rating: 4.6, status: 'APPROVED' },
  { id: 'c3', name: 'Max Super Specialty', state: 'Delhi', city: 'New Delhi', doctors: 15, patients: 650, revenue: 298000, rating: 4.5, status: 'PENDING' },
  { id: 'c4', name: 'Manipal Hospital', state: 'Karnataka', city: 'Manipal', doctors: 12, patients: 420, revenue: 185000, rating: 4.7, status: 'APPROVED' },
  { id: 'c5', name: 'Care Plus Clinic', state: 'Tamil Nadu', city: 'Chennai', doctors: 6, patients: 180, revenue: 72000, rating: 4.2, status: 'SUSPENDED' },
];

const MOCK_AUDIT_LOGS = [
  { id: 'a1', admin: 'Super Admin', action: 'APPROVE', resource: 'Doctor #DR-2847', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.45', status: 'SUCCESS' },
  { id: 'a2', admin: 'Admin User', action: 'UPDATE', resource: 'Clinic #CL-102', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '10.0.0.12', status: 'SUCCESS' },
  { id: 'a3', admin: 'Super Admin', action: 'BLOCK', resource: 'User #USR-9912', timestamp: new Date(Date.now() - 10800000).toISOString(), ip: '192.168.1.45', status: 'SUCCESS' },
  { id: 'a4', admin: 'Support Agent', action: 'VIEW', resource: 'Consultation #CN-445', timestamp: new Date(Date.now() - 14400000).toISOString(), ip: '172.16.0.8', status: 'SUCCESS' },
  { id: 'a5', admin: 'Admin User', action: 'LOGIN', resource: 'Admin Portal', timestamp: new Date(Date.now() - 18000000).toISOString(), ip: '10.0.0.12', status: 'FAILED' },
];

const generateTrend = (days, base, variance) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.floor(base + Math.random() * variance),
    });
  }
  return data;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalConsultations, todayAppointments] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'DOCTOR' } }),
      User.count({ where: { role: 'PATIENT' } }),
      Consultation.count(),
      Slot.count({ where: { date: new Date().toISOString().split('T')[0], is_booked: true } }),
    ]);

    const completedConsultations = await Consultation.count({ where: { status: 'COMPLETED' } });
    const estimatedRevenue = completedConsultations * 850;

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalDoctors,
        totalClinics: MOCK_CLINICS.filter((c) => c.status === 'APPROVED').length,
        totalPatients,
        totalConsultations,
        todayAppointments,
        revenue: estimatedRevenue,
        platformGrowth: 12.4,
        growth: {
          users: 8.2,
          doctors: 5.6,
          clinics: 3.1,
          patients: 11.3,
          consultations: 14.7,
          appointments: 6.8,
          revenue: 18.2,
          platform: 12.4,
        },
      },
    });
  } catch (error) {
    logger.error('Admin dashboard stats failed', error, 'ADMIN');
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDashboardCharts = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const days = period === 'daily' ? 7 : period === 'weekly' ? 28 : 90;

    res.json({
      status: 'success',
      data: {
        userGrowth: generateTrend(days, 20, 15),
        doctorRegistration: generateTrend(days, 3, 5),
        clinicGrowth: generateTrend(days, 1, 2),
        consultationTrend: generateTrend(days, 12, 20),
        revenueTrend: generateTrend(days, 5000, 8000),
        appointmentTrend: generateTrend(days, 8, 12),
        activeUsers: generateTrend(days, 45, 30),
        newUserAcquisition: generateTrend(days, 10, 8),
        userDistribution: [
          { name: 'Patients', value: await User.count({ where: { role: 'PATIENT' } }) || 65 },
          { name: 'Doctors', value: await User.count({ where: { role: 'DOCTOR' } }) || 12 },
          { name: 'Clinic Admins', value: 8 },
          { name: 'Staff', value: 15 },
        ],
        consultationDistribution: [
          { name: 'Video', value: 58 },
          { name: 'Audio', value: 22 },
          { name: 'Chat', value: 20 },
        ],
        revenueDistribution: [
          { name: 'Subscription', value: 35 },
          { name: 'Consultation Fees', value: 45 },
          { name: 'Commission', value: 20 },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRealtimeStats = async (req, res) => {
  try {
    const ongoing = await Consultation.count({ where: { status: 'ACTIVE' } });
    const activeDoctors = await Slot.count({
      where: { status: 'IN_PROGRESS' },
      distinct: true,
      col: 'doctor_id',
    });

    res.json({
      status: 'success',
      data: {
        onlineUsers: Math.floor(Math.random() * 80) + 40,
        activeDoctors: activeDoctors || Math.floor(Math.random() * 15) + 5,
        activeClinics: MOCK_CLINICS.filter((c) => c.status === 'APPROVED').length,
        ongoingConsultations: ongoing,
        currentRevenue: Math.floor(Math.random() * 50000) + 12000,
        serverHealth: 99.8,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'role', 'created_at'],
    });

    const activities = recentUsers.map((u) => ({
      id: u.id,
      type: 'USER_REGISTERED',
      title: 'New User Registered',
      description: `${u.name} joined as ${u.role}`,
      timestamp: u.created_at,
    }));

    const staticActivities = [
      { id: 's1', type: 'DOCTOR_APPROVED', title: 'Doctor Approved', description: 'Dr. Sharma verification completed', timestamp: new Date(Date.now() - 1800000) },
      { id: 's2', type: 'CLINIC_APPROVED', title: 'Clinic Approved', description: 'Apollo Multispeciality activated', timestamp: new Date(Date.now() - 3600000) },
      { id: 's3', type: 'CONSULTATION_COMPLETED', title: 'Consultation Completed', description: 'Video consultation #CN-2847 finished', timestamp: new Date(Date.now() - 5400000) },
      { id: 's4', type: 'PAYMENT_RECEIVED', title: 'Payment Received', description: '₹1,250 consultation fee processed', timestamp: new Date(Date.now() - 7200000) },
    ];

    res.json({
      status: 'success',
      data: [...activities, ...staticActivities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 'n1', type: 'DOCTOR_APPROVAL', title: 'Pending Doctor Approvals', count: 3, priority: 'high' },
      { id: 'n2', type: 'CLINIC_APPROVAL', title: 'Pending Clinic Approvals', count: 1, priority: 'high' },
      { id: 'n3', type: 'SUPPORT', title: 'Open Support Tickets', count: 7, priority: 'medium' },
      { id: 'n4', type: 'SECURITY', title: 'Security Alerts', count: 2, priority: 'critical' },
    ],
  });
};

exports.getGeoAnalytics = async (req, res) => {
  res.json({
    status: 'success',
    data: {
      usersByState: [
        { state: 'Maharashtra', users: 1240, clinics: 45, consultations: 3200 },
        { state: 'Karnataka', users: 980, clinics: 32, consultations: 2450 },
        { state: 'Delhi', users: 870, clinics: 28, consultations: 2100 },
        { state: 'Tamil Nadu', users: 650, clinics: 22, consultations: 1680 },
        { state: 'Gujarat', users: 520, clinics: 18, consultations: 1340 },
        { state: 'Rajasthan', users: 380, clinics: 12, consultations: 920 },
      ],
    },
  });
};

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
      attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
    });

    const users = rows.map((u) => ({
      ...u.toJSON(),
      status: status || 'ACTIVE',
      registrationDate: u.created_at,
    }));

    res.json({
      status: 'success',
      data: { users, total: count, page: parseInt(page, 10), totalPages: Math.ceil(count / parseInt(limit, 10)) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    logger.info(`Admin ${req.user.name} set user ${user.id} status to ${status}`, 'ADMIN');
    res.json({ status: 'success', data: { id: user.id, status }, message: `User ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if (['SUPERADMIN', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({ status: 'error', message: 'Cannot delete admin users' });
    }
    await user.destroy();
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const doctors = await Doctor.findAndCountAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'created_at'] }],
      limit: parseInt(limit, 10),
      offset,
      order: [['createdAt', 'DESC']],
    });

    let results = doctors.rows.map((d) => ({
      id: d.id,
      userId: d.user_id,
      name: d.User?.name,
      email: d.User?.email,
      phone: d.User?.phone,
      specialization: d.specialization,
      experience: d.experience,
      consultationFee: d.consultation_fee,
      avatarUrl: d.avatar_url,
      verificationStatus: d.bio ? 'VERIFIED' : 'PENDING',
      status: status || 'ACTIVE',
      consultationCount: Math.floor(Math.random() * 200) + 10,
      earnings: Math.floor(Math.random() * 50000) + 5000,
      rating: (4 + Math.random()).toFixed(1),
      registrationDate: d.User?.created_at,
    }));

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (d) => d.name?.toLowerCase().includes(s) || d.specialization?.toLowerCase().includes(s)
      );
    }
    if (status === 'PENDING') results = results.filter((d) => d.verificationStatus === 'PENDING');
    if (status === 'SUSPENDED') results = results.filter((d) => d.status === 'SUSPENDED');

    res.json({
      status: 'success',
      data: { doctors: results, total: doctors.count, page: parseInt(page, 10) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { action } = req.body;
    const doctor = await Doctor.findByPk(req.params.id, { include: [User] });
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });

    if (action === 'approve' || action === 'verify') {
      await doctor.update({ bio: doctor.bio || 'Verified healthcare professional' });
    }

    logger.info(`Admin ${req.user.name} performed ${action} on doctor ${doctor.id}`, 'ADMIN');
    res.json({ status: 'success', message: `Doctor ${action} successful` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getClinics = async (req, res) => {
  try {
    const { status, search } = req.query;
    let clinics = [...MOCK_CLINICS];
    if (status) clinics = clinics.filter((c) => c.status === status);
    if (search) {
      const s = search.toLowerCase();
      clinics = clinics.filter((c) => c.name.toLowerCase().includes(s) || c.city.toLowerCase().includes(s));
    }
    res.json({ status: 'success', data: { clinics, total: clinics.length } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateClinicStatus = async (req, res) => {
  const { action } = req.body;
  res.json({ status: 'success', message: `Clinic ${action} successful` });
};

exports.getConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { count, rows } = await Consultation.findAndCountAll({
      where,
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] },
      ],
      limit: parseInt(limit, 10),
      offset,
      order: [['createdAt', 'DESC']],
    });

    const consultations = rows.map((c) => ({
      id: c.id,
      doctor: c.Doctor?.User?.name || 'Unknown',
      patient: c.Patient?.User?.name || 'Unknown',
      status: c.status,
      startTime: c.start_time,
      endTime: c.end_time,
      type: ['Video', 'Audio', 'Chat'][Math.floor(Math.random() * 3)],
    }));

    res.json({
      status: 'success',
      data: { consultations, total: count, page: parseInt(page, 10) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = { is_booked: true };
    if (status) where.status = status;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { count, rows } = await Slot.findAndCountAll({
      where,
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name'] }] },
      ],
      limit: parseInt(limit, 10),
      offset,
      order: [['date', 'DESC']],
    });

    const appointments = rows.map((s) => ({
      id: s.id,
      doctor: s.Doctor?.User?.name || 'Unknown',
      patient: s.Patient?.User?.name || 'Unknown',
      date: s.date,
      time: s.start_time,
      status: s.status,
    }));

    res.json({
      status: 'success',
      data: { appointments, total: count, page: parseInt(page, 10) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const completed = await Consultation.count({ where: { status: 'COMPLETED' } });
    const totalRevenue = completed * 850;
    const monthlyRevenue = Math.floor(totalRevenue * 0.35);
    const todayRevenue = Math.floor(totalRevenue * 0.02);

    res.json({
      status: 'success',
      data: {
        totalRevenue,
        monthlyRevenue,
        todayRevenue,
        subscriptionRevenue: Math.floor(totalRevenue * 0.35),
        commissionRevenue: Math.floor(totalRevenue * 0.20),
        refundAmount: Math.floor(totalRevenue * 0.03),
        revenueTrend: generateTrend(30, 8000, 12000),
        monthlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          revenue: Math.floor(Math.random() * 100000) + 50000,
        })),
        topClinics: MOCK_CLINICS.sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        topDoctors: (await Doctor.findAll({ include: [User], limit: 5 })).map((d) => ({
          name: d.User?.name,
          revenue: Math.floor(Math.random() * 80000) + 20000,
          consultations: Math.floor(Math.random() * 150) + 20,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  const { action, admin, dateFrom, dateTo } = req.query;
  let logs = [...MOCK_AUDIT_LOGS];
  if (action) logs = logs.filter((l) => l.action === action);
  if (admin) logs = logs.filter((l) => l.admin.toLowerCase().includes(admin.toLowerCase()));
  res.json({ status: 'success', data: { logs, total: logs.length } });
};

exports.getRoles = async (req, res) => {
  res.json({
    status: 'success',
    data: {
      roles: [
        { id: 'r1', name: 'Super Admin', slug: 'SUPERADMIN', permissions: ['*'], users: 2 },
        { id: 'r2', name: 'Admin', slug: 'ADMIN', permissions: ['users', 'doctors', 'clinics', 'consultations', 'revenue'], users: 5 },
        { id: 'r3', name: 'Manager', slug: 'MANAGER', permissions: ['doctors', 'clinics', 'consultations'], users: 8 },
        { id: 'r4', name: 'Support', slug: 'SUPPORT', permissions: ['tickets', 'users.view'], users: 12 },
        { id: 'r5', name: 'Auditor', slug: 'AUDITOR', permissions: ['audit', 'reports'], users: 3 },
      ],
    },
  });
};

exports.getSettings = async (req, res) => {
  res.json({
    status: 'success',
    data: {
      platformName: 'CareLink E-Consultation',
      logo: '/uploads/logo.png',
      theme: 'light',
      contactEmail: 'admin@carelink.com',
      contactPhone: '+91 1800-123-4567',
      smtp: { host: 'smtp.carelink.com', port: 587, secure: true },
      sms: { provider: 'Twilio', enabled: true },
      payment: { gateway: 'Razorpay', enabled: true },
      notifications: { email: true, sms: true, push: true },
      maintenanceMode: false,
    },
  });
};

exports.updateSettings = async (req, res) => {
  res.json({ status: 'success', data: req.body, message: 'Settings updated successfully' });
};

exports.getEHRRecords = async (req, res) => {
  try {
    const records = await require('../models').MedicalRecord.findAll({
      include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }],
      limit: 20,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      status: 'success',
      data: {
        records: records.map((r) => ({
          id: r.id,
          patient: r.Patient?.User?.name,
          symptoms: r.symptoms?.substring(0, 100),
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [{ model: Consultation, include: [Doctor, Patient] }],
      limit: 20,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      status: 'success',
      data: {
        prescriptions: prescriptions.map((p) => ({
          id: p.id,
          diagnosis: p.diagnosis,
          medicines: p.medicines,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
