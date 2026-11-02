const prisma = require('../utils/prisma');
const { logError } = require('../utils/logger');

async function admin(req, res, next) {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error){
    logError('admin.guard', error, { userId: req.user?.id });
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = admin;