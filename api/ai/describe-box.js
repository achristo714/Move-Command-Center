import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

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
}
