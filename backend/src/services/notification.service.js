const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');
const ExcelJS = require('exceljs');
const { Slot, Doctor, Patient, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send SMS wrapper with logging
 */
const sendSMS = async (to, body) => {
  try {
    // Basic verification of number format
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      // Assuming default region is India (+91) if 10 digits
      if (formattedTo.length === 10) {
        formattedTo = '+91' + formattedTo;
      } else {
        logger.warn(`SMS number ${to} might not be in correct international format.`, 'TWILIO');
      }
    }

    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo
    });
    logger.success(`SMS successfully dispatched to ${formattedTo}. SID: ${message.sid}`, 'TWILIO');
    return message;
  } catch (error) {
    logger.error(`Failed to send SMS to ${to}`, error, 'TWILIO');
  }
};

/**
 * Triggered on new slot booking: send confirmations to patient & doctor
 */
const sendBookingConfirmationAlerts = async (slotId) => {
  try {
    const slot = await Slot.findByPk(slotId, {
      include: [
        { model: Doctor, include: [{ model: User }] },
        { model: Patient, include: [{ model: User }] }
      ]
    });

    if (!slot || !slot.Doctor || !slot.Patient) {
      logger.warn(`Could not find doctor/patient associations for slot booking SMS. Slot ID: ${slotId}`, 'NOTIFY');
      return;
    }

    const doctorName = slot.Doctor.User?.name || 'Doctor';
    const patientName = slot.Patient.User?.name || 'Patient';
    const patientAge = slot.Patient.age || 'N/A';
    const bookingDate = slot.date;
    // Format start time to human readable
    const bookingTime = slot.start_time.substring(0, 5);

    // 1. SMS to Patient
    const patientSmsBody = `Hello ${patientName}, your consultation booking with Dr. ${doctorName} on ${bookingDate} at ${bookingTime} is confirmed. Thank you for choosing CareLink!`;
    const patientPhone = slot.Patient.User?.phone;
    if (patientPhone) {
      await sendSMS(patientPhone, patientSmsBody);
    }

    // 2. SMS to Doctor
    const doctorSmsBody = `CareLink Booking Alert: Patient ${patientName} (Age: ${patientAge}) has booked a slot on ${bookingDate} at ${bookingTime}. Please be ready.`;
    const doctorPhone = slot.Doctor.User?.phone;
    if (doctorPhone) {
      await sendSMS(doctorPhone, doctorSmsBody);
    }

  } catch (error) {
    logger.error(`Error in sendBookingConfirmationAlerts for slot ${slotId}`, error, 'NOTIFY');
  }
};

/**
 * Periodically checks for upcoming slots and dispatches SMS reminders
 */
const dispatchUpcomingReminders = async () => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date();

    // Fetch all active bookings for today
    const slots = await Slot.findAll({
      where: {
        date: today,
        is_booked: true,
        status: 'BOOKED',
        [Op.or]: [
          { patient_reminder_sent: false },
          { doctor_reminder_sent: false }
        ]
      },
      include: [
        { model: Doctor, include: [{ model: User }] },
        { model: Patient, include: [{ model: User }] }
      ]
    });

    for (const slot of slots) {
      try {
        // Parse time slot.start_time (format hh:mm:ss)
        const [hours, minutes, seconds] = slot.start_time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, seconds || 0, 0);

        const diffMs = slotTime - now;
        const diffMins = diffMs / 1000 / 60;

        const doctorName = slot.Doctor.User?.name || 'Doctor';
        const patientName = slot.Patient.User?.name || 'Patient';
        const bookingTime = slot.start_time.substring(0, 5);

        // 1. Patient Reminder (20 minutes before)
        if (diffMins > 0 && diffMins <= 20 && !slot.patient_reminder_sent) {
          const patientPhone = slot.Patient.User?.phone;
          if (patientPhone) {
            const body = `Reminder: Hello ${patientName}, your meeting scheduled with Dr. ${doctorName} starts in 20 minutes (at ${bookingTime}). Please prepare. - CareLink`;
            await sendSMS(patientPhone, body);
          }
          await slot.update({ patient_reminder_sent: true });
        }

        // 2. Doctor Reminder (10 minutes before)
        if (diffMins > 0 && diffMins <= 10 && !slot.doctor_reminder_sent) {
          const doctorPhone = slot.Doctor.User?.phone;
          if (doctorPhone) {
            const body = `CareLink Schedule Alert: Dr. ${doctorName}, your session with patient ${patientName} starts in 10 minutes (at ${bookingTime}). - CareLink`;
            await sendSMS(doctorPhone, body);
          }
          await slot.update({ doctor_reminder_sent: true });
        }
      } catch (slotErr) {
        logger.error(`Error processing reminder for slot ${slot.id}`, slotErr, 'REMINDE');
      }
    }
  } catch (error) {
  console.error('REMINDER ERROR');
  console.error(error);
}
};

/**
 * Compiles patient list and sends daily report email to all active doctors
 */
const sendDailyReports = async () => {
  try {
    logger.info('Compiling and sending daily report emails to clinicians...', 'REPORT');
    const today = new Date().toLocaleDateString('en-CA');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');

    const doctors = await Doctor.findAll({
      include: [{ model: User }]
    });

    for (const doctor of doctors) {
      if (!doctor.User || !doctor.User.email) continue;

      try {
        // Today's Slots
        const todaySlots = await Slot.findAll({
          where: {
            doctor_id: doctor.id,
            date: today
          },
          include: [{ model: Patient, include: [{ model: User }] }]
        });

        // Tomorrow's Slots
        const tomorrowSlots = await Slot.findAll({
          where: {
            doctor_id: doctor.id,
            date: tomorrow
          }
        });

        const bookedToday = todaySlots.filter(s => s.is_booked);
        const attendedToday = todaySlots.filter(s => s.status === 'COMPLETED' || s.status === 'IN_PROGRESS');
        const bookedTomorrow = tomorrowSlots.filter(s => s.is_booked);

        const consultationFee = parseFloat(doctor.consultation_fee) || 0;
        const totalRevenue = bookedToday.length * consultationFee;

        // Generate Excel file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Today's Patients");

        // Styling headers
        worksheet.columns = [
          { header: 'Patient Name', key: 'name', width: 25 },
          { header: 'Age', key: 'age', width: 10 },
          { header: 'Mobile Number', key: 'phone', width: 18 },
          { header: 'Booked Time', key: 'time', width: 15 },
          { header: 'Booking Date', key: 'date', width: 15 },
          { header: 'Fee (INR)', key: 'fee', width: 12 }
        ];

        // Format header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1E293B' } // Slate 800
        };

        // Add rows
        bookedToday.forEach(slot => {
          worksheet.addRow({
            name: slot.Patient?.User?.name || 'N/A',
            age: slot.Patient?.age || 'N/A',
            phone: slot.Patient?.User?.phone || 'N/A',
            time: slot.start_time.substring(0, 5),
            date: slot.date,
            fee: consultationFee
          });
        });

        // Add blank row and Revenue Row
        worksheet.addRow({});
        const revRow = worksheet.addRow({
          name: 'Total Revenue',
          fee: totalRevenue
        });
        revRow.font = { bold: true };
        revRow.getCell('fee').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F1F5F9' } // Slate 100
        };

        // Write buffer to attach to email
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Email Body
        const mailOptions = {
          from: `"CareLink Institutional" <${process.env.SMTP_USER}>`,
          to: doctor.User.email,
          subject: `Daily Operational Report - ${today} | CareLink`,
          html: `
            <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <div style="background-color: #0284c7; padding: 24px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800;">CareLink</h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">Clinical Performance Summary</p>
              </div>
              <div style="padding: 24px;">
                <p style="margin-top: 0;">Dear <strong>Dr. ${doctor.User.name.replace(/^(Dr\.\s*)+/i, '')}</strong>,</p>
                <p>Please find below your operational metrics and patient summary for <strong>${today}</strong>. Your full list of patient interactions is attached in the Excel spreadsheet.</p>
                
                <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 12px; margin: 24px 0;">
                  <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px;">
                    <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Specialization</span>
                    <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #0284c7;">${doctor.specialization || 'Clinical Specialist'}</p>
                  </div>
                  <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px;">
                    <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Today's Revenue</span>
                    <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #10b981;">INR ${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0;">
                      <th style="text-align: left; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b;">Metric</th>
                      <th style="text-align: right; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b;">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; font-size: 13px;">Today's Booked Slots</td>
                      <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right;">${bookedToday.length}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; font-size: 13px;">Attended / Completed Slots</td>
                      <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right;">${attendedToday.length}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; font-size: 13px;">Tomorrow's Scheduled Slots</td>
                      <td style="padding: 10px 0; font-size: 13px; font-weight: bold; text-align: right; color: #f59e0b;">${bookedTomorrow.length}</td>
                    </tr>
                  </tbody>
                </table>

                <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
                  This is an automated operational report generated by the CareLink Platform. For modifications or support, please contact the institution administrator.
                </p>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                &copy; 2026 CareLink Health Services. All rights reserved.
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `PatientReport_${today}.xlsx`,
              content: excelBuffer,
              contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        logger.success(`Daily report email successfully sent to Dr. ${doctor.User.name} (${doctor.User.email})`, 'REPORT');
      } catch (docErr) {
        logger.error(`Error generating/sending daily report for doctor ${doctor.id}`, docErr, 'REPORT');
      }
    }
  } catch (error) {
    logger.error('Error generating daily reports', error, 'REPORT');
  }
};

/**
 * Initializes scheduling for reminders (every minute) and daily reports (every day at 10 PM)
 */
const initCronJobs = () => {
  // 1. Reminders: Checked every minute
  cron.schedule('* * * * *', () => {
    dispatchUpcomingReminders();
  });
  logger.info('Scheduled active notification checks: Every 1 Minute.', 'CRON');

  // 2. Daily Report: Checked at 22:00 (10 PM) every day
  cron.schedule('0 22 * * *', () => {
    sendDailyReports();
  });
  logger.info('Scheduled Daily Operational Report Email Dispatch: Daily at 22:00 (10 PM).', 'CRON');
};

module.exports = {
  sendBookingConfirmationAlerts,
  dispatchUpcomingReminders,
  sendDailyReports,
  initCronJobs
};
