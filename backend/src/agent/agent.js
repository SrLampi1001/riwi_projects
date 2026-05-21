const OpenAI = require('openai');
const SYSTEM_PROMPT = require('./prompt');
const { TOOL_DEFINITIONS, executeTool } = require('./tools');
const { getMemory, appendMessage } = require('../db/memory');

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL,
});

const MODEL = process.env.NVIDIA_MODEL || 'mistralai/mixtral-8x7b-instruct-v0.1';

/**
 * Run the agent for a given user message and session.
 * Returns: { reply: string, toolsUsed: Array<{ name, args, result }> }
 */
async function runAgent(sessionId, userMessage) {
  // 1. Persist user message
  await appendMessage(sessionId, { role: 'user', content: userMessage });

  // 2. Build message array: system + memory window
  const memory = await getMemory(sessionId);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...memory.map((m) => ({
      role: m.role === 'tool' ? 'user' : m.role, // flatten tool results for models that need it
      content: m.toolName
        ? `[Tool result from ${m.toolName}]: ${m.content}`
        : m.content,
    })),
  ];

  const toolsUsed = [];

  // 3. First LLM call
  let response = await client.chat.completions.create({
    model: MODEL,
    messages,
    tools: TOOL_DEFINITIONS,
    tool_choice: 'auto',
    max_tokens: 1024,
    temperature: 0.7,
  });

  let choice = response.choices[0];

  // 4. Tool-calling loop (handles chained tool calls)
  while (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
    const toolCallResults = [];

    for (const toolCall of choice.message.tool_calls) {
      const toolName = toolCall.function.name;
      let toolArgs = {};

      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = {};
      }

      const toolResult = await executeTool(toolName, toolArgs);
      const toolResultStr = JSON.stringify(toolResult);

      toolsUsed.push({ name: toolName, args: toolArgs, result: toolResult });

      // Persist tool result in memory
      await appendMessage(sessionId, {
        role: 'tool',
        content: toolResultStr,
        toolName,
      });

      toolCallResults.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolResultStr,
      });
    }

    // Append assistant's tool_calls message + tool results, then call again
    messages.push(choice.message);
    messages.push(...toolCallResults);

    response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.7,
    });

    choice = response.choices[0];
  }

  // 5. Final text reply
  const reply = choice.message?.content || 'Sorry, I could not generate a response.';

  // 6. Persist assistant reply
  await appendMessage(sessionId, { role: 'assistant', content: reply });

  return { reply, toolsUsed };
}

module.exports = { runAgent };
