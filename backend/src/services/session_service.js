const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

// Create a new session
async function createSession(userId, mode) {
  const session = await prisma.session.create({
    data: {
      userId,
      mode
    }
  });

  return session;
}

// Get session by id — verifies ownership
async function getSession(sessionId, userId) {
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

// List all sessions for a user
async function listSessions(userId) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { lastInteraction: 'desc' }
  });

  return sessions;
}

// Delete a session — verifies ownership
async function deleteSession(sessionId, userId) {
  await getSession(sessionId, userId);

  await prisma.session.delete({
    where: { id: sessionId }
  });
}

// Update session title after first message
async function updateSessionTitle(sessionId, title) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { title }
  });
}

// Update session title — verifies ownership
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

// Update lastInteraction timestamp
async function touchSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastInteraction: new Date() }
  });
}

// Lock session — marks it as currently streaming
async function lockSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isStreaming: true }
  });
}

// Unlock session — marks it as no longer streaming
async function unlockSession(sessionId) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isStreaming: false }
  });
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
  unlockSession
};