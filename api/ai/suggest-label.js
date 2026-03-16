import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  try {
    const { contents, roomName } = req.body
    if (!contents) return res.status(400).json({ error: 'contents required' })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `You help label moving boxes. Given these box contents: "${contents}"${roomName ? ` (going to ${roomName})` : ''}\n\nSuggest a short, clear label for this box (3-5 words max). Reply with ONLY the label, nothing else.`,
      }],
    })

    const text = response.content.find(b => b.type === 'text')?.text || ''
    res.json({ label: text.trim() })
  } catch (e) {
    console.error('suggest-label error:', e)
    res.status(500).json({ error: 'AI request failed' })
  }
}
