const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

const VALID_ROLES = ['user', 'assistant'];

// Save a message to the database
async function saveMessage(sessionId, role, content) {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError('Invalid message role', 400);
  }

  const message = await prisma.message.create({
    data: {
      sessionId,
      role,
      content
    }
  });

  return message;
}

// Get all messages from a session
async function getSessionMessages(sessionId) {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  });

  return messages;
}

module.exports = { saveMessage, getSessionMessages };