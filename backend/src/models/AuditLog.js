const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  actor: { type: String, default: null }, // email or id
  action: { type: String, required: true },
  target: { type: String, default: null }, // user id or resource
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);
