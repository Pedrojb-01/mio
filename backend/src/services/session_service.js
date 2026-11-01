const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');
const { validateUUID } = require('../utils/validate');

async function createSession(userId, mode) {
  const session = await prisma.session.create({
    data: {
      userId,
      mode
    }
  });

  return session;
}

async function getSession(sessionId, userId) {
  if (!validateUUID(sessionId)) {
    throw new AppError('Session not found', 404);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  return session;
}

async function listSessions(userId) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { lastInteraction: 'desc' }
  });

  return sessions;
}

async function deleteSession(sessionId, userId) {
  await getSession(sessionId, userId);

  await prisma.session.delete({
    where: { id: sessionId }
  });
}

async function updateSessionTitle(sessionId, title) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { title }
  });
}

async function renameSession(sessionId, userId, title) {
  await getSession(sessionId, userId);

  if (!title || title.trim() === '') {
    throw new AppError('Title cannot be empty', 400);
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { title: title.trim() }
  });
}

async function touchSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastInteraction: new Date() }
  });
}

async function lockSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isStreaming: true }
  });
}

async function unlockSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isStreaming: false }
  });
}

async function resetOrphanedSessions() {
  const { count } = await prisma.session.updateMany({
    where: { isStreaming: true },
    data:  { isStreaming: false }
  });
  if (count > 0) console.log(`[startup] Reset ${count} orphaned streaming session(s).`);
}

module.exports = {
  createSession,
  getSession,
  listSessions,
  deleteSession,
  updateSessionTitle,
  touchSession,
  renameSession,
  lockSession,
  unlockSession,
  resetOrphanedSessions
};