const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const userModel = require('../models/userModel');

// Verifies the JWT and attaches the authenticated user to req.user.
// This is the backend enforcement layer — the frontend hiding buttons
// is not sufficient authorization on its own.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
    }

    const user = await userModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact an administrator.' });
    }

    req.user = user; // { id, name, email, role, status, ... }
    next();
  } catch (err) {
    next(err);
  }
}

// Must run AFTER authenticate. Restricts a route to admin-role users only.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
