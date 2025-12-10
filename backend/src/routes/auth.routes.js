// backend/src/routes/auth.routes.js
const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public endpoints
router.post('/register', auth.register);
router.post('/login', auth.login);

// Password reset
router.post('/request-password-reset', auth.requestPasswordReset);
router.post('/reset-password', auth.resetPassword);

// Refresh token (must be POST)
router.post('/token', auth.refresh);

// Logout
router.post('/logout', auth.logout);

// MFA endpoints (protected)
router.post('/mfa/setup', verifyToken, auth.setupMFA);
router.post('/mfa/verify', verifyToken, auth.verifyMFA);

module.exports = router;
