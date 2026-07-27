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

// Get platform stats
async function getStats() {
  const now = new Date()

  // Last 7 days window
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    onboardingComplete,
    totalSessions,
    brainstormSessions,
    creationSessions,
    totalMessages,
    newUsersRaw,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'user' } }),
    prisma.user.count({ where: { role: 'user', status: 'active' } }),
    prisma.user.count({ where: { role: 'user', status: 'blocked' } }),
    prisma.profile.count({ where: { onboardingComplete: true, user: { role: 'user' } } }),
    prisma.session.count(),
    prisma.session.count({ where: { mode: 'brainstorm' } }),
    prisma.session.count({ where: { mode: 'creation' } }),
    prisma.message.count(),
    prisma.user.findMany({
      where: { role: 'user', createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Group new users by day label (Mon, Tue, …)
  const dayMap = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    dayMap[label] = 0
  }

  for (const u of newUsersRaw) {
    const label = new Date(u.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    if (label in dayMap) dayMap[label]++
  }

  const newUsersPerDay = Object.entries(dayMap).map(([day, count]) => ({ day, count }))

  return {
    users: { total: totalUsers, active: activeUsers, blocked: blockedUsers, onboardingComplete },
    sessions: { total: totalSessions, brainstorm: brainstormSessions, creation: creationSessions },
    messages: { total: totalMessages },
    newUsersPerDay,
  }
}

module.exports = { listUsers, updateUserStatus, getStats };