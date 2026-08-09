const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'tool'], required: true },
  content: { type: String, required: true },
  toolName: { type: String, default: null }, // populated when role === 'tool'
  timestamp: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Session = mongoose.model('Session', SessionSchema);

const MEMORY_WINDOW = 7; // last N messages kept in context

/**
 * Get the last MEMORY_WINDOW messages for a session.
 */
async function getMemory(sessionId) {
  const session = await Session.findOne({ sessionId });
  if (!session) return [];
  return session.messages.slice(-MEMORY_WINDOW);
}

/**
 * Append a message to session memory.
 * Trims to the last MEMORY_WINDOW * 2 messages to avoid unbounded growth.
 */
async function appendMessage(sessionId, { role, content, toolName = null }) {
  const update = {
    $push: {
      messages: { role, content, toolName },
    },
    $set: { updatedAt: new Date() },
  };

  await Session.findOneAndUpdate({ sessionId }, update, {
    upsert: true,
    new: true,
  });

  // Trim old messages beyond the window * 2 buffer
  await Session.findOneAndUpdate(
    { sessionId },
    [
      {
        $set: {
          messages: {
            $slice: ['$messages', -(MEMORY_WINDOW * 2)],
          },
        },
      },
    ]
  );
}

/**
 * Clear a session's memory (optional utility).
 */
async function clearMemory(sessionId) {
  await Session.findOneAndUpdate({ sessionId }, { $set: { messages: [] } });
}

module.exports = { getMemory, appendMessage, clearMemory };
