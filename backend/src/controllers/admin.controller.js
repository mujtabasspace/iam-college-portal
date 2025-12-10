const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const ROOT_ADMIN_EMAIL = "admin@college.local";

// Helper
function isRootAdmin(user) {
  return user.email?.toLowerCase() === ROOT_ADMIN_EMAIL;
}

// =============================
// LIST USERS
// =============================
exports.listUsers = async (req, res) => {
  try {
    // optional basic search + pagination support
    const { search = "", page = 1, limit = 50 } = req.query;

    const q = {};
    if (search.trim()) {
      q.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(q)
      .select('-password -resetPasswordToken -resetPasswordExpires -__v')
      .skip(skip)
      .limit(Number(limit));

    return res.json(users);
  } catch (err) {
    console.error('listUsers err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// CHANGE ROLE
// =============================
exports.changeRole = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role)
    return res.status(400).json({ message: 'Missing fields' });

  if (!['student', 'faculty', 'admin'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user))
      return res.status(403).json({ message: 'Cannot change role of root admin' });

    const previous = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      actor: req.user.id,
      action: 'change_role',
      target: user._id.toString(),
      details: { from: previous, to: role }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('changeRole err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// DISABLE USER
// =============================
exports.disableUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: 'Missing userId' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user))
      return res.status(403).json({ message: 'Cannot disable root admin' });

    user.disabled = true;
    await user.save();

    await AuditLog.create({
      actor: req.user.id,
      action: 'disable_user',
      target: user._id.toString()
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('disableUser err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// ENABLE USER
// =============================
exports.enableUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: 'Missing userId' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    user.disabled = false;
    await user.save();

    await AuditLog.create({
      actor: req.user.id,
      action: 'enable_user',
      target: user._id.toString()
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('enableUser err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// DELETE USER
// =============================
exports.deleteUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: 'Missing userId' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user))
      return res.status(403).json({ message: 'Cannot delete root admin' });

    await User.findByIdAndDelete(userId);

    await AuditLog.create({
      actor: req.user.id,
      action: 'delete_user',
      target: userId
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('deleteUser err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =============================
// GET LOGS (with filters)
// =============================
exports.getLogs = async (req, res) => {
  try {
    const {
      search = "",
      action = "",
      page = 1,
      limit = 200
    } = req.query;

    const q = {};

    if (search.trim()) {
      q.$or = [
        { actor: new RegExp(search, 'i') },
        { action: new RegExp(search, 'i') },
        { target: new RegExp(search, 'i') }
      ];
    }

    if (action.trim()) {
      q.action = action;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find(q)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json(logs);
  } catch (err) {
    console.error('getLogs err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
