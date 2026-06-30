const { listUsers, updateUserStatus } = require('../services/admin_service');

const VALID_STATUSES = ['active', 'blocked'];

async function listUsersController(req, res) {
  try {
    const users = await listUsers();
    return res.status(200).json({ users });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status must be active or blocked' });
    }

    const user = await updateUserStatus(id, status);
    return res.status(200).json({ message: 'User status updated successfully', user });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listUsersController, updateUserStatusController };