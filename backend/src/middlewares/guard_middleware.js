const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function guard(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is not blocked
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.status === 'blocked') {
      return res.status(401).json({ message: 'Access denied' });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = guard;