require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Patient = require('./models/Patient');

async function testGenerateId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Sort by createdAt: -1
    const last = await Patient.findOne().sort({ createdAt: -1 }).select('patientId createdAt');
    console.log('Last patient:', last);
    
    if (!last || !last.patientId) return console.log('CS-0001');
    const num = parseInt(last.patientId.split('-')[1], 10) + 1;
    const newId = `CS-${String(num).padStart(4, '0')}`;
    console.log('Generated ID:', newId);
    
    // Check if newId exists
    const exists = await Patient.findOne({ patientId: newId });
    if (exists) {
        console.log('ERROR: Generated ID already exists in DB!');
        console.log('Existing patient:', exists.patientId, exists.name);
    } else {
        console.log('OK: Generated ID is unique.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

testGenerateId();
