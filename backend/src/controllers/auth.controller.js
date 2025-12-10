// backend/src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { signAccess, signRefresh } = require('../utils/tokens');
const { sendResetEmail } = require('../utils/email.mock');

const REFRESH_COOKIE_PATH = '/api/auth/token';

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mfaEnabled: user?.mfa?.enabled || false
});

// =============================
// REGISTER
// =============================
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: role || 'student' });

    await AuditLog.create({ actor: user.email, action: 'register', target: user._id.toString() });

    return res.json({ message: 'Registered', user: formatUser(user) });
  } catch (err) {
    console.error('register err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// LOGIN
// =============================
exports.login = async (req, res) => {
  const { email, password, totp } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.disabled) return res.status(403).json({ message: 'Account disabled' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      await AuditLog.create({ actor: email, action: 'login_failed', details: { reason: 'bad_password' } });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.mfa && user.mfa.enabled) {
      if (!totp) return res.status(401).json({ message: 'MFA token required' });

      const verified = speakeasy.totp.verify({ secret: user.mfa.secret, encoding: 'base32', token: totp, window: 1 });
      if (!verified) {
        await AuditLog.create({ actor: user.email, action: 'mfa_failed', target: user._id.toString() });
        return res.status(401).json({ message: 'Invalid MFA token' });
      }
    }

    const access = signAccess(user);
    const refresh = signRefresh(user);

    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    await AuditLog.create({ actor: user.email, action: 'login', target: user._id.toString() });

    return res.json({ accessToken: access, user: formatUser(user) });
  } catch (err) {
    console.error('login err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// REFRESH TOKEN
// =============================
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.disabled) return res.status(403).json({ message: 'Account disabled' });

    const access = signAccess(user);
    return res.json({ accessToken: access, user: formatUser(user) });
  } catch (err) {
    console.error('refresh err', err);
    return res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
};

// =============================
// LOGOUT
// =============================
exports.logout = (req, res) => {
  res.clearCookie('refreshToken', { path: REFRESH_COOKIE_PATH });
  res.json({ ok: true });
};

// =============================
// MFA SETUP
// =============================
exports.setupMFA = async (req, res) => {
  try {
    console.log("🔥 [DEBUG] Incoming request to /auth/mfa/setup");
    console.log("🔥 [DEBUG] req.user =", req.user);

    const user = await User.findById(req.user.id);

    console.log("🔥 [DEBUG] Fetched user =", user);

    if (!user) {
      console.log("🔥 [DEBUG] User not found in DB");
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.mfa) {
      console.log("🔥 [DEBUG] user.mfa was missing → initializing default object");
      user.mfa = { enabled: false, secret: null };
    }

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `IAM-College:${user.email}`
    });

    console.log("🔥 [DEBUG] Generated MFA secret:", secret.base32);

    user.mfa.secret = secret.base32;
    user.mfa.enabled = false;
    await user.save();

    console.log("🔥 [DEBUG] Saving secret to DB done.");

    const qr = await qrcode.toDataURL(secret.otpauth_url);
    console.log("🔥 [DEBUG] QR generated.");

    return res.json({ qr, secret: secret.base32 });

  } catch (err) {
    console.error("🔥 [ERROR] setupMFA err:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// VERIFY MFA
// =============================
exports.verifyMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.mfa || !user.mfa.secret) return res.status(400).json({ message: 'MFA not initiated' });

    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const verified = speakeasy.totp.verify({ secret: user.mfa.secret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    user.mfa.enabled = true;
    await user.save();
    await AuditLog.create({ actor: user.email, action: 'mfa_enabled', target: user._id.toString() });

    return res.json({ ok: true });
  } catch (err) {
    console.error('verifyMFA err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// PASSWORD RESET REQUEST
// =============================
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ ok: true });

    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    await sendResetEmail({ to: user.email, resetLink });

    await AuditLog.create({ actor: user.email, action: 'password_reset_requested', target: user._id.toString() });

    return res.json({ ok: true });
  } catch (err) {
    console.error('requestPasswordReset err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  try {
    const user = await User.findOne({ email: email.toLowerCase(), resetPasswordToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) return res.status(400).json({ message: 'Token expired' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await AuditLog.create({ actor: user.email, action: 'password_reset', target: user._id.toString() });

    return res.json({ ok: true });
  } catch (err) {
    console.error('resetPassword err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
