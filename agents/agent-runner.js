const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic()

/**
 * Run an agent with Claude API (non-streaming, returns full text)
 */
async function runAgent(systemPrompt, messages, options = {}) {
  const { model = 'claude-sonnet-4-6', maxTokens = 4096, temperature = 0.7 } = options

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  return { text, usage: response.usage }
}

/**
 * Run an agent with SSE streaming
 * Calls onChunk(text) for each text delta, returns full text when done
 */
async function runAgentStream(systemPrompt, messages, onChunk, options = {}) {
  const { model = 'claude-sonnet-4-6', maxTokens = 4096, temperature = 0.7 } = options

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })

  let fullText = ''

  stream.on('text', (text) => {
    fullText += text
    if (onChunk) onChunk(text)
  })

  await stream.finalMessage()
  return fullText
}

module.exports = { runAgent, runAgentStream }
