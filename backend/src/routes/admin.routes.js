const router = require('express').Router();
const admin = require('../controllers/admin.controller');
const authMw = require('../middleware/auth.middleware');
const rbac = require('../middleware/rbac.middleware');

// All admin routes require valid token + admin role
router.get('/users', authMw.verifyToken, rbac(['admin']), admin.listUsers);
router.post('/role', authMw.verifyToken, rbac(['admin']), admin.changeRole);
router.post('/disable', authMw.verifyToken, rbac(['admin']), admin.disableUser);
router.post('/enable', authMw.verifyToken, rbac(['admin']), admin.enableUser);
router.post('/delete', authMw.verifyToken, rbac(['admin']), admin.deleteUser);
router.get('/logs', authMw.verifyToken, rbac(['admin']), admin.getLogs);

module.exports = router;
