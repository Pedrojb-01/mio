const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { logError } = require('../utils/logger');

async function guard(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.status === 'blocked') {
      return res.status(401).json({ message: 'Access denied' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logError('auth.guard', error, { userId: decoded.id });
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = guard;