const { listUsers, updateUserStatus, getStats, deleteUser } = require('../services/admin_service');

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
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getStatsController(req, res) {
  try {
    const VALID_PERIODS = ['today', '7d', '30d', 'all']
    const period = VALID_PERIODS.includes(req.query.period) ? req.query.period : '7d'
    const stats = await getStats(period)
    return res.status(200).json({ stats })
  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

async function deleteUserController(req, res) {
  try {
    await deleteUser(req.params.id, req.user.id)
    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { listUsersController, updateUserStatusController, getStatsController, deleteUserController };