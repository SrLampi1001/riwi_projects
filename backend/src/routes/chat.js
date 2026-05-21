const express = require('express');
const { runAgent } = require('../agent/agent');

const router = express.Router();

/**
 * POST /api/chat
 * Body: { sessionId: string, message: string }
 * Returns: { reply: string, toolsUsed: Array<{ name, args, result }> }
 */
router.post('/', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required and must be a string.' });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  try {
    const { reply, toolsUsed } = await runAgent(sessionId.trim(), message.trim());
    return res.json({ reply, toolsUsed });
  } catch (error) {
    console.error('❌ Agent error:', error?.message || error);
    return res.status(500).json({
      error: 'The agent encountered an error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

module.exports = router;
