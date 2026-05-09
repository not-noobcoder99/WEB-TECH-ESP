const Patient = require('../models/Patient');

// Generate next patientId in CS-XXXX format
const generatePatientId = async () => {
  const last = await Patient.findOne().sort({ createdAt: -1 }).select('patientId');
  if (!last || !last.patientId) return 'CS-0001';
  const num = parseInt(last.patientId.split('-')[1], 10) + 1;
  return `CS-${String(num).padStart(4, '0')}`;
};

// GET /api/patients
const getPatients = async (req, res, next) => {
  try {
    const { status, riskLevel, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = { $ne: 'discharged' };
    if (riskLevel) filter.riskLevel = riskLevel;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [patients, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('assignedClinician', 'fullName email'),
      Patient.countDocuments(filter)
    ]);

    res.json({ patients, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:id
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedClinician', 'fullName email');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

// POST /api/patients
const createPatient = async (req, res, next) => {
  try {
    const { name, age, sex, email, phone, medicalHistory, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal, assignedClinician } = req.body;

    if (!name || age === undefined || sex === undefined) {
      return res.status(400).json({ message: 'name, age, and sex are required' });
    }

    const patientId = await generatePatientId();
    const patient = await Patient.create({
      patientId, name, age, sex, email, phone, medicalHistory,
      cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal,
      assignedClinician: assignedClinician || req.user.id
    });

    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
};

// PUT /api/patients/:id
const updatePatient = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.patientId; // patientId is immutable

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...updates, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/patients/:id  (soft-delete: set status to discharged)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'discharged', lastUpdated: new Date() },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient discharged', patientId: patient.patientId });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:id/notes
const getNotes = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select('notes')
      .populate('notes.addedBy', 'fullName role');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) { next(err); }
};

// POST /api/patients/:id/notes
const addNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Note content is required' });
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { content: content.trim(), addedBy: req.user.id } } },
      { new: true }
    ).populate('notes.addedBy', 'fullName role');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const newNote = patient.notes[patient.notes.length - 1];
    res.status(201).json(newNote);
  } catch (err) { next(err); }
};

// DELETE /api/patients/:id/notes/:noteId
const deleteNote = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const note = patient.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.addedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot delete another user\'s note' });
    }
    patient.notes.pull(req.params.noteId);
    await patient.save();
    res.json({ message: 'Note deleted' });
  } catch (err) { next(err); }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient, getNotes, addNote, deleteNote };
