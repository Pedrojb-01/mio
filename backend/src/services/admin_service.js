const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

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
    throw new AppError('User not found', 404);
  }

  if (user.role === 'admin') {
    throw new AppError('Cannot change status of an admin user', 403);
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