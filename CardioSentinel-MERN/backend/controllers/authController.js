const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// Generate next patientId (duplicated from patientController to avoid circular dep)
const generatePatientId = async () => {
  const last = await Patient.findOne().sort({ createdAt: -1 }).select('patientId');
  if (!last || !last.patientId) return 'CS-0001';
  const num = parseInt(last.patientId.split('-')[1], 10) + 1;
  return `CS-${String(num).padStart(4, '0')}`;
};

// POST /api/auth/register  (patients only — staff accounts created by admin)
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, age, sex, dateOfBirth } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'username, email, password and fullName are required' });
    }
    if (age === undefined || sex === undefined) {
      return res.status(400).json({ message: 'age and sex are required for patient registration' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const user = await User.create({ username, email, password, fullName, phone, dateOfBirth, role: 'patient' });

    // Auto-create linked Patient document
    const patientId = await generatePatientId();
    await Patient.create({
      patientId,
      userId: user._id,
      name: fullName,
      age: Number(age),
      sex: Number(sex),
      email,
      phone,
      status: 'active',
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/admin/create-user  (admin only — creates clinician/nurse/admin accounts)
const createStaffUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, role, department, phone } = req.body;

    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'username, email, password, fullName and role are required' });
    }
    if (!['clinician', 'nurse', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid staff roles: clinician, nurse, admin' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const user = await User.create({ username, email, password, fullName, role, department, phone });
    res.status(201).json({ message: 'Staff account created', user: { id: user._id, username, email, fullName, role, department } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      phone: user.phone,
      createdAt: user.createdAt
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, department, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, department, phone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: { id: user._id, fullName: user.fullName, department: user.department, phone: user.phone } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/users/:id  (admin only)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (department !== undefined) update.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, getAllUsers, updateUser, createStaffUser };
