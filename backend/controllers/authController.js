const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await userModel.create({ name, email: email.toLowerCase(), passwordHash, role: 'user' });
    const user = await userModel.findById(id);
    const token = signToken(user);

    res.status(201).json({ success: true, message: 'Account created successfully.', token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'This account has been disabled. Contact an administrator.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await userModel.updateLastLogin(user.id);
    const token = signToken(user);

    res.json({ success: true, message: 'Logged in successfully.', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email.toLowerCase());

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'This admin account has been disabled.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    await userModel.updateLastLogin(user.id);
    const token = signToken(user);

    res.json({ success: true, message: 'Admin login successful.', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ success: true, user: req.user });
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const fullUser = await userModel.findByEmail(req.user.email);

    const match = await bcrypt.compare(currentPassword, fullUser.password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await userModel.updatePassword(req.user.id, newHash);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    await userModel.updateProfile(req.user.id, { name });
    const user = await userModel.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, adminLogin, me, changePassword, updateProfile };
