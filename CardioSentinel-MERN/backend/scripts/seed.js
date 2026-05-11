/**
 * CardioSentinel – Database Seed Script
 * Populates MongoDB Atlas with realistic demo data:
 *   • 1 admin + 2 clinician users
 *   • 10 patients (varied risk levels)
 *   • ~50 telemetry readings (5 per patient)
 *   • 10 self-reports
 *   • 15+ alerts (mix of stable / watchlist / urgent, many pending)
 *   • 5 support tickets
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Telemetry = require('../models/Telemetry');
const Alert = require('../models/Alert');
const SelfReport = require('../models/SelfReport');
const Ticket = require('../models/Ticket');

// ─── helpers ───────────────────────────────────────────────────────
const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[randInt(0, arr.length - 1)];
const daysAgo = d => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };

// ─── main ──────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas …');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // ── wipe previous seed data ──
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Telemetry.deleteMany({}),
      Alert.deleteMany({}),
      SelfReport.deleteMany({}),
      Ticket.deleteMany({}),
    ]);
    console.log('🗑  Cleared existing collections.');

    // ════════════════════════════════════════════════════════════════
    // 1. USERS  (admin + 2 clinicians)
    // ════════════════════════════════════════════════════════════════
    const usersData = [
      { username: 'admin', email: 'admin@cardiosentinel.com', password: 'Admin@123', fullName: 'Dr. Sarah Ahmed', role: 'admin', department: 'Administration' },
      { username: 'dr.khan', email: 'dr.khan@cardiosentinel.com', password: 'Clinician@1', fullName: 'Dr. Imran Khan', role: 'clinician', department: 'Cardiology' },
      { username: 'dr.farah', email: 'dr.farah@cardiosentinel.com', password: 'Clinician@2', fullName: 'Dr. Farah Malik', role: 'clinician', department: 'Internal Medicine' },
    ];
    const users = await User.create(usersData);
    const [adminUser, clinician1, clinician2] = users;
    console.log(`👥 Created ${users.length} users.`);

    // ════════════════════════════════════════════════════════════════
    // 2. PATIENTS  (10)
    // ════════════════════════════════════════════════════════════════
    const patientsData = [
      { patientId: 'CS-1001', name: 'Ahmed Raza', age: 58, sex: 1, email: 'ahmed.raza@mail.com', phone: '0300-1234567', medicalHistory: 'Hypertension, Type-2 Diabetes', cp: 2, trestbps: 150, chol: 263, fbs: 1, restecg: 1, thalach: 130, exang: 0, oldpeak: 1.5, slope: 1, ca: 1, thal: 2, riskLevel: 'high', lastRiskScore: 0.82, assignedClinician: clinician1._id, status: 'active' },
      { patientId: 'CS-1002', name: 'Fatima Noor', age: 45, sex: 0, email: 'fatima.noor@mail.com', phone: '0321-7654321', medicalHistory: 'Family history of heart disease', cp: 1, trestbps: 128, chol: 220, fbs: 0, restecg: 0, thalach: 155, exang: 0, oldpeak: 0.5, slope: 2, ca: 0, thal: 2, riskLevel: 'low', lastRiskScore: 0.18, assignedClinician: clinician1._id, status: 'active' },
      { patientId: 'CS-1003', name: 'Muhammad Ali', age: 67, sex: 1, email: 'mali@mail.com', phone: '0333-1112233', medicalHistory: 'Previous MI, Stent placement 2022', cp: 3, trestbps: 165, chol: 310, fbs: 1, restecg: 2, thalach: 110, exang: 1, oldpeak: 3.2, slope: 0, ca: 3, thal: 3, riskLevel: 'high', lastRiskScore: 0.94, assignedClinician: clinician2._id, status: 'active' },
      { patientId: 'CS-1004', name: 'Ayesha Siddiqui', age: 52, sex: 0, email: 'ayesha.s@mail.com', phone: '0345-9876543', medicalHistory: 'Mild mitral valve regurgitation', cp: 0, trestbps: 122, chol: 195, fbs: 0, restecg: 0, thalach: 162, exang: 0, oldpeak: 0.0, slope: 2, ca: 0, thal: 2, riskLevel: 'low', lastRiskScore: 0.12, assignedClinician: clinician1._id, status: 'active' },
      { patientId: 'CS-1005', name: 'Hassan Iqbal', age: 61, sex: 1, email: 'hassan.iq@mail.com', phone: '0312-5556677', medicalHistory: 'Smoking 20 yrs, Chronic bronchitis', cp: 2, trestbps: 142, chol: 275, fbs: 1, restecg: 1, thalach: 125, exang: 1, oldpeak: 2.1, slope: 1, ca: 2, thal: 3, riskLevel: 'high', lastRiskScore: 0.78, assignedClinician: clinician2._id, status: 'active' },
      { patientId: 'CS-1006', name: 'Zainab Tariq', age: 39, sex: 0, email: 'zainab.t@mail.com', phone: '0301-4445566', medicalHistory: 'Anxiety disorder, Palpitations', cp: 1, trestbps: 118, chol: 198, fbs: 0, restecg: 0, thalach: 170, exang: 0, oldpeak: 0.2, slope: 2, ca: 0, thal: 2, riskLevel: 'low', lastRiskScore: 0.09, assignedClinician: clinician1._id, status: 'active' },
      { patientId: 'CS-1007', name: 'Usman Ghani', age: 55, sex: 1, email: 'usman.g@mail.com', phone: '0322-8889900', medicalHistory: 'Hyperlipidemia, Sedentary lifestyle', cp: 2, trestbps: 138, chol: 248, fbs: 0, restecg: 1, thalach: 140, exang: 0, oldpeak: 1.0, slope: 1, ca: 1, thal: 2, riskLevel: 'moderate', lastRiskScore: 0.52, assignedClinician: clinician2._id, status: 'active' },
      { patientId: 'CS-1008', name: 'Sana Mehmood', age: 48, sex: 0, email: 'sana.m@mail.com', phone: '0335-6667788', medicalHistory: 'Gestational diabetes history', cp: 0, trestbps: 126, chol: 212, fbs: 0, restecg: 0, thalach: 158, exang: 0, oldpeak: 0.3, slope: 2, ca: 0, thal: 2, riskLevel: 'moderate', lastRiskScore: 0.35, assignedClinician: clinician1._id, status: 'active' },
      { patientId: 'CS-1009', name: 'Bilal Hussain', age: 72, sex: 1, email: 'bilal.h@mail.com', phone: '0311-2223344', medicalHistory: 'CABG 2019, CKD Stage 3', cp: 3, trestbps: 158, chol: 295, fbs: 1, restecg: 2, thalach: 105, exang: 1, oldpeak: 2.8, slope: 0, ca: 2, thal: 3, riskLevel: 'high', lastRiskScore: 0.91, assignedClinician: clinician2._id, status: 'active' },
      { patientId: 'CS-1010', name: 'Mariam Sheikh', age: 43, sex: 0, email: 'mariam.sh@mail.com', phone: '0344-3334455', medicalHistory: 'No significant history', cp: 0, trestbps: 115, chol: 185, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 0.0, slope: 2, ca: 0, thal: 2, riskLevel: 'low', lastRiskScore: 0.07, assignedClinician: clinician1._id, status: 'active' },
    ];
    const patients = await Patient.create(patientsData);
    console.log(`🏥 Created ${patients.length} patients.`);

    // ════════════════════════════════════════════════════════════════
    // 3. TELEMETRY  (5 readings per patient, spread over last 7 days)
    // ════════════════════════════════════════════════════════════════
    const telemetryDocs = [];
    const deviceTypes = ['Wearable ECG Patch', 'Bedside Monitor', 'Smart Watch', 'Portable BP Cuff'];

    for (const pt of patients) {
      for (let i = 0; i < 5; i++) {
        const isHigh = pt.riskLevel === 'high';
        const hr = isHigh ? randInt(95, 135) : randInt(62, 90);
        const sys = isHigh ? randInt(140, 185) : randInt(110, 135);
        const dia = isHigh ? randInt(85, 110) : randInt(65, 82);
        const rr = isHigh ? randInt(18, 30) : randInt(12, 18);
        const spo2 = isHigh ? randInt(88, 95) : randInt(96, 100);
        const riskScore = isHigh ? rand(0.65, 0.98) : rand(0.03, 0.45);
        const riskLevel = riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'moderate' : 'low';

        telemetryDocs.push({
          patientId: pt._id,
          heartRate: hr,
          systolicBP: sys,
          diastolicBP: dia,
          respirationRate: rr,
          oxygenSaturation: spo2,
          temperature: rand(36.2, 37.8),
          signalQuality: randInt(80, 100),
          deviceType: pick(deviceTypes),
          aiPrediction: {
            riskScore,
            riskLevel,
            prediction: riskScore >= 0.5 ? 1 : 0,
            confidence: rand(0.70, 0.97),
            triggeredAlert: riskScore >= 0.65,
          },
          readingTimestamp: daysAgo(randInt(0, 6)),
        });
      }
    }
    const telemetries = await Telemetry.insertMany(telemetryDocs);
    console.log(`📡 Created ${telemetries.length} telemetry readings.`);

    // ════════════════════════════════════════════════════════════════
    // 4. ALERTS  (urgent + watchlist + stable, mostly PENDING)
    // ════════════════════════════════════════════════════════════════
    const alertDocs = [];
    const riskFactorPool = [
      'Elevated resting blood pressure', 'High cholesterol', 'Abnormal ECG pattern',
      'Exercise-induced angina detected', 'ST depression > 2mm', 'Tachycardia episode',
      'Low oxygen saturation', 'Irregular heart rhythm', 'Fasting blood sugar elevated',
    ];
    const recommendations = {
      urgent: 'Immediate clinical review required. Consider emergency triage.',
      watchlist: 'Schedule follow-up within 24–48 hrs. Monitor vitals closely.',
      stable: 'Continue routine monitoring. No immediate intervention needed.',
    };

    // For high-risk patients → urgent alerts (PENDING so they show on dashboard)
    for (const pt of patients.filter(p => p.riskLevel === 'high')) {
      const tel = telemetries.find(t => t.patientId.equals(pt._id) && t.aiPrediction.riskScore >= 0.65);
      alertDocs.push({
        patientId: pt._id,
        telemetryId: tel ? tel._id : undefined,
        alertType: 'urgent',
        riskScore: rand(0.75, 0.98),
        confidence: rand(0.80, 0.95),
        riskFactors: [pick(riskFactorPool), pick(riskFactorPool), pick(riskFactorPool)],
        recommendation: recommendations.urgent,
        status: 'pending',
        createdAt: daysAgo(randInt(0, 2)),
      });
    }

    // watchlist alerts for moderate patients
    for (const pt of patients.filter(p => p.riskLevel === 'moderate')) {
      const tel = telemetries.find(t => t.patientId.equals(pt._id));
      alertDocs.push({
        patientId: pt._id,
        telemetryId: tel ? tel._id : undefined,
        alertType: 'watchlist',
        riskScore: rand(0.40, 0.64),
        confidence: rand(0.72, 0.90),
        riskFactors: [pick(riskFactorPool), pick(riskFactorPool)],
        recommendation: recommendations.watchlist,
        status: 'pending',
        createdAt: daysAgo(randInt(0, 3)),
      });
    }

    // stable alerts for some low-risk patients
    for (const pt of patients.filter(p => p.riskLevel === 'low').slice(0, 3)) {
      alertDocs.push({
        patientId: pt._id,
        alertType: 'stable',
        riskScore: rand(0.05, 0.25),
        confidence: rand(0.85, 0.97),
        riskFactors: [],
        recommendation: recommendations.stable,
        status: pick(['pending', 'reviewed']),
        reviewedBy: pick([clinician1._id, clinician2._id]),
        reviewedAt: daysAgo(randInt(0, 1)),
        createdAt: daysAgo(randInt(1, 5)),
      });
    }

    // A few additional urgent alerts created TODAY for live dashboard notifications
    for (let i = 0; i < 3; i++) {
      const highPt = pick(patients.filter(p => p.riskLevel === 'high'));
      alertDocs.push({
        patientId: highPt._id,
        alertType: 'urgent',
        riskScore: rand(0.80, 0.97),
        confidence: rand(0.85, 0.96),
        riskFactors: [pick(riskFactorPool), pick(riskFactorPool)],
        recommendation: 'CRITICAL – Immediate physician review. Vitals trending dangerously.',
        status: 'pending',
        createdAt: new Date(), // NOW
      });
    }

    const alerts = await Alert.insertMany(alertDocs);
    console.log(`🚨 Created ${alerts.length} alerts (${alerts.filter(a => a.status === 'pending').length} pending).`);

    // ════════════════════════════════════════════════════════════════
    // 5. SELF-REPORTS  (10 reports across patients)
    // ════════════════════════════════════════════════════════════════

    // Create patient user accounts so self-reports have a userId
    const patientUsersData = patients.slice(0, 5).map((pt, i) => ({
      username: `patient_${pt.patientId.toLowerCase().replace('-', '')}`,
      email: pt.email,
      password: 'Patient@123',
      fullName: pt.name,
      role: 'patient',
    }));
    const patientUsers = await User.create(patientUsersData);

    // Link patient users
    for (let i = 0; i < patientUsers.length; i++) {
      patients[i].userId = patientUsers[i]._id;
      await patients[i].save();
    }

    const selfReportDocs = [];
    for (let i = 0; i < 10; i++) {
      const idx = i % 5;
      const pt = patients[idx];
      const pu = patientUsers[idx];
      const riskScore = rand(0.05, 0.92);
      const riskLevel = riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'moderate' : 'low';
      selfReportDocs.push({
        patientId: pt._id,
        userId: pu._id,
        features: {
          age: pt.age, sex: pt.sex, cp: pt.cp, trestbps: pt.trestbps + randInt(-10, 10),
          chol: pt.chol + randInt(-15, 15), fbs: pt.fbs, restecg: pt.restecg,
          thalach: pt.thalach + randInt(-8, 8), exang: pt.exang, oldpeak: +(pt.oldpeak + rand(-0.3, 0.3)).toFixed(1),
          slope: pt.slope, ca: pt.ca, thal: pt.thal,
        },
        aiPrediction: {
          riskScore,
          riskLevel,
          prediction: riskScore >= 0.5 ? 1 : 0,
          confidence: rand(0.72, 0.96),
          featureContributions: [],
          triggeredAlert: riskScore >= 0.65,
        },
        createdAt: daysAgo(randInt(0, 10)),
      });
    }
    const selfReports = await SelfReport.insertMany(selfReportDocs);
    console.log(`📝 Created ${selfReports.length} self-reports.`);

    // ════════════════════════════════════════════════════════════════
    // 6. TICKETS  (5)
    // ════════════════════════════════════════════════════════════════
    const ticketsData = [
      { name: 'Dr. Imran Khan', email: 'dr.khan@cardiosentinel.com', ticketType: 'clinical-followup', subject: 'High-risk patient CS-1003 follow-up', message: 'Patient Muhammad Ali showed sustained elevated BP over the last 3 days. Need to discuss medication adjustment and possible in-clinic evaluation.', status: 'open', priority: 'high', createdAt: daysAgo(1) },
      { name: 'Fatima Noor', email: 'fatima.noor@mail.com', ticketType: 'telemetry-issue', subject: 'Wearable device disconnecting frequently', message: 'My ECG wearable patch keeps losing Bluetooth connection every 30 minutes. Signal quality drops below 50%. I have tried re-pairing but the issue persists.', status: 'open', priority: 'medium', createdAt: daysAgo(2) },
      { name: 'Dr. Farah Malik', email: 'dr.farah@cardiosentinel.com', ticketType: 'model-question', subject: 'AI risk score clarification for patient CS-1005', message: 'The AI model assigned a 0.78 risk score to Hassan Iqbal but the latest labs show improved cholesterol. Can the model be retrained or manually re-evaluated for this case?', status: 'in-progress', priority: 'medium', createdAt: daysAgo(3) },
      { name: 'Hassan Iqbal', email: 'hassan.iq@mail.com', ticketType: 'general', subject: 'Request for monthly health summary report', message: 'I would like to receive a monthly PDF summary of my vitals trend and risk assessment. Is this feature available in the patient portal or can it be added?', status: 'open', priority: 'low', createdAt: daysAgo(4) },
      { name: 'Dr. Sarah Ahmed', email: 'admin@cardiosentinel.com', ticketType: 'research', subject: 'Data export for IRB cardiac study proposal', message: 'We are preparing an IRB proposal for a retrospective study on remote cardiac monitoring outcomes. Need de-identified telemetry export for the last 6 months of data.', status: 'open', priority: 'high', createdAt: daysAgo(0) },
    ];
    const tickets = await Ticket.insertMany(ticketsData);
    console.log(`🎫 Created ${tickets.length} tickets.`);

    // ── summary ──
    console.log('\n════════════════════════════════════════');
    console.log('  ✅  SEED COMPLETE');
    console.log('════════════════════════════════════════');
    console.log(`  Users          : ${users.length + patientUsers.length}`);
    console.log(`  Patients       : ${patients.length}`);
    console.log(`  Telemetry      : ${telemetries.length}`);
    console.log(`  Alerts         : ${alerts.length}  (pending: ${alerts.filter(a => a.status === 'pending').length})`);
    console.log(`  Self-Reports   : ${selfReports.length}`);
    console.log(`  Tickets        : ${tickets.length}`);
    console.log('════════════════════════════════════════\n');

    console.log('🔑 Login credentials:');
    console.log('   admin    →  admin@cardiosentinel.com   / Admin@123');
    console.log('   clinician→  dr.khan@cardiosentinel.com / Clinician@1');
    console.log('   clinician→  dr.farah@cardiosentinel.com/ Clinician@2');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
  }
}

seed();
