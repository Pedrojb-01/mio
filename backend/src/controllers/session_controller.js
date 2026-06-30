const { createSession, getSession, listSessions, deleteSession, renameSession, updateSessionTitle, touchSession, lockSession, unlockSession } = require('../services/session_service');
const { saveMessage, getSessionMessages } = require('../services/message_service');
const { getProfile } = require('../services/profile_service');
const { streamResponse, generateTitle } = require('../services/ai_service');

const VALID_MODES = ['brainstorm', 'creation'];

// Send a message — creates session if it doesn't exist
async function sendMessageController(req, res) {
  const userId = req.user.id;
  const { message, mode, sessionId } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  // Fetch profile and verify onboarding is complete
  let profile;
  try {
    profile = await getProfile(userId);
  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!profile.onboardingComplete) {
    return res.status(403).json({ message: 'Onboarding must be completed before sending messages' });
  }

  let session;
  try {
    if (sessionId) {
      session = await getSession(sessionId, userId);
    } else {
      if (!mode || !VALID_MODES.includes(mode)) {
        return res.status(400).json({ message: 'Mode must be brainstorm or creation' });
      }
      session = await createSession(userId, mode);
    }
  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (session.isStreaming) {
    return res.status(409).json({ message: 'Session is already processing a message' });
  }

  await lockSession(session.id);

  try {
    const history = await getSessionMessages(session.id);
    const isFirstMessage = history.length === 0;

    await saveMessage(session.id, 'user', message.trim());

    const fullResponse = await streamResponse(
      profile,
      session.mode,
      history,
      message.trim(),
      res
    );

    await saveMessage(session.id, 'assistant', fullResponse);
    await touchSession(session.id);

    if (isFirstMessage) {
      const title = await generateTitle(message.trim(), fullResponse);
      await updateSessionTitle(session.id, title);
    }

  } catch (error) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ message: 'Failed to process message' });
    }
  } finally {
    await unlockSession(session.id);
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
    if (error.isAppError) {
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
    if (error.isAppError) {
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
    if (error.isAppError) {
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