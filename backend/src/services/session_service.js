const prisma = require('../utils/prisma');

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
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  if (session.userId !== userId) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
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
    const error = new Error('Title cannot be empty');
    error.statusCode = 400;
    throw error;
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

module.exports = {
  createSession,
  getSession,
  listSessions,
  deleteSession,
  updateSessionTitle,
  touchSession,
  renameSession
};