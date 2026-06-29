const { createSession, getSession, listSessions, deleteSession, renameSession, updateSessionTitle, touchSession } = require('../services/session_service');
const { saveMessage, getSessionMessages } = require('../services/message_service');
const { getProfile } = require('../services/profile_service');
const { streamResponse, generateTitle } = require('../services/ai_service');
const prisma = require('../utils/prisma');

// Send a message — creates session if it doesn't exist
async function sendMessageController(req, res) {
  const userId = req.user.id;
  const { message, mode, sessionId } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  let session;

  try {
    if (sessionId) {
      session = await getSession(sessionId, userId);
    } else {
      if (!mode) {
        return res.status(400).json({ message: 'Mode is required to start a new session' });
      }
      session = await createSession(userId, mode);
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }

  // Check if session is already streaming
  if (session.isStreaming) {
    return res.status(409).json({ message: 'Session is already processing a message' });
  }

  // Lock session
  await prisma.session.update({
    where: { id: session.id },
    data: { isStreaming: true }
  });

  try {
    const [profile, history] = await Promise.all([
      getProfile(userId),
      getSessionMessages(session.id)
    ]);

    const isFirstMessage = history.length === 0;

    // Save user message
    await saveMessage(session.id, 'user', message.trim());

    // Stream AI response
    const fullResponse = await streamResponse(
      profile,
      session.mode,
      history,
      message.trim(),
      res
    );

    // Save AI response
    await saveMessage(session.id, 'assistant', fullResponse);

    // Update last interaction
    await touchSession(session.id);

    // Generate and save title on first message
    if (isFirstMessage) {
      const title = await generateTitle(message.trim(), fullResponse);
      await updateSessionTitle(session.id, title);
    }

  } finally {
    await prisma.session.update({
      where: { id: session.id },
      data: { isStreaming: false }
    });
  }
}

// List all sessions
async function listSessionsController(req, res) {
  try {
    const sessions = await listSessions(req.user.id);
    return res.status(200).json({ sessions });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get session with messages
async function getSessionController(req, res) {
  try {
    const session = await getSession(req.params.id, req.user.id);
    const messages = await getSessionMessages(session.id);
    return res.status(200).json({ session, messages });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete session
async function deleteSessionController(req, res) {
  try {
    await deleteSession(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Rename session
async function renameSessionController(req, res) {
  try {
    const { title } = req.body;
    await renameSession(req.params.id, req.user.id, title);
    return res.status(200).json({ message: 'Session renamed successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  sendMessageController,
  listSessionsController,
  getSessionController,
  deleteSessionController,
  renameSessionController
};