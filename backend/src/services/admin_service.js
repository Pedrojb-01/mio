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
async function getStats(period = '7d') {
  const now = new Date()

  // Build the date window and grouping strategy based on period
  let since = null
  let groupByMonth = false

  if (period === 'today') {
    since = new Date(now)
    since.setHours(0, 0, 0, 0)
  } else if (period === '7d') {
    since = new Date(now)
    since.setDate(since.getDate() - 6)
    since.setHours(0, 0, 0, 0)
  } else if (period === '30d') {
    since = new Date(now)
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)
  } else {
    // all — group by month
    groupByMonth = true
  }

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
      where: { role: 'user', ...(since ? { createdAt: { gte: since } } : {}) },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  let chartData = []

  if (groupByMonth) {
    // Group by "Mon YYYY" — all time
    const monthMap = {}
    for (const u of newUsersRaw) {
      const label = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthMap[label] = (monthMap[label] ?? 0) + 1
    }
    chartData = Object.entries(monthMap).map(([day, count]) => ({ day, count }))
  } else if (period === 'today') {
    // Group by hour (0h, 1h, … 23h)
    const hourMap = {}
    for (let h = 0; h < 24; h++) {
      hourMap[`${h}h`] = 0
    }
    for (const u of newUsersRaw) {
      const hour = new Date(u.createdAt).getHours()
      hourMap[`${hour}h`]++
    }
    chartData = Object.entries(hourMap).map(([day, count]) => ({ day, count }))
  } else {
    // Group by day — 7d or 30d
    const days = period === '7d' ? 7 : 30
    const dayMap = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap[label] = 0
    }
    for (const u of newUsersRaw) {
      const label = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (label in dayMap) dayMap[label]++
    }
    chartData = Object.entries(dayMap).map(([day, count]) => ({ day, count }))
  }

  return {
    users: { total: totalUsers, active: activeUsers, blocked: blockedUsers, onboardingComplete },
    sessions: { total: totalSessions, brainstorm: brainstormSessions, creation: creationSessions },
    messages: { total: totalMessages },
    chartData,
  }
}

// Delete a user
async function deleteUser(userId, requestingAdminId) {
  if (userId === requestingAdminId) {
    throw new AppError('You cannot delete your own account', 403)
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (user.role === 'admin') {
    throw new AppError('Cannot delete an admin user', 403)
  }

  await prisma.user.delete({ where: { id: userId } })
}

// Promote a user to admin
async function promoteUser(userId, requestingAdminId) {
  if (userId === requestingAdminId) {
    throw new AppError('You cannot change your own role', 403)
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (user.role === 'admin') {
    throw new AppError('User is already an admin', 409)
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: 'admin' },
    select: { id: true, name: true, email: true, status: true, role: true },
  })

  return updatedUser
}

module.exports = { listUsers, updateUserStatus, getStats, deleteUser, promoteUser };