const prisma = require('../utils/prisma');

// Save a message to the database
async function saveMessage(sessionId, role, content) {
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