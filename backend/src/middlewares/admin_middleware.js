const prisma = require('../utils/prisma');

async function admin(req, res, next) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
}

module.exports = admin;