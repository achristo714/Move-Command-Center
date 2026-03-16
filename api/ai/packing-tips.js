import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  try {
    const { roomName, items = [] } = req.body
    if (!roomName) return res.status(400).json({ error: 'roomName required' })

    const itemContext = items.length > 0
      ? `\nKnown items in this room: ${items.join(', ')}`
      : ''

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are a professional moving consultant. Give 4-5 short, practical packing tips for the "${roomName}" of an apartment. Focus on protecting fragile items, efficient box usage, and what to pack last.${itemContext}\n\nFormat as a numbered list. Keep each tip to 1-2 sentences.`,
      }],
    })

    const text = response.content.find(b => b.type === 'text')?.text || ''
    res.json({ tips: text })
  } catch (e) {
    console.error('packing-tips error:', e)
    res.status(500).json({ error: 'AI request failed' })
  }
}
