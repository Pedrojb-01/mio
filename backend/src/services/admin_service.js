const prisma = require('../utils/prisma');

// List all users
async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return users;
}

// Block or unblock a user
async function updateUserStatus(userId, status) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') {
    const error = new Error('Cannot change status of an admin user');
    error.statusCode = 403;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true
    }
  });

  return updatedUser;
}

module.exports = { listUsers, updateUserStatus };