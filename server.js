import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const client = new Anthropic() // uses ANTHROPIC_API_KEY env var

// ── AI: Describe box contents from a photo ──
app.post('/api/ai/describe-box', async (req, res) => {
  try {
    const { imageBase64, mediaType = 'image/jpeg' } = req.body
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: 'You are helping someone pack for a move. Look at this photo of items being packed into a moving box. List the visible items as a short comma-separated list (no more than 10 items). Be specific but concise. Example: "books, desk lamp, phone charger, picture frame"',
          },
        ],
      }],
    })

    const text = response.content.find(b => b.type === 'text')?.text || ''
    res.json({ description: text })
  } catch (e) {
    console.error('describe-box error:', e)
    res.status(500).json({ error: 'AI request failed' })
  }
})

// ── AI: Generate packing tips for a room ──
app.post('/api/ai/packing-tips', async (req, res) => {
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
})

// ── AI: Smart label suggestion ──
app.post('/api/ai/suggest-label', async (req, res) => {
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
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`MoveHQ API server running on http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY not set — AI features will fail')
  }
})
