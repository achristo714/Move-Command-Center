const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`)
  return res.json()
}

export const ai = {
  /** Describe box contents from a base64-encoded photo */
  async describeBox(imageBase64, mediaType = 'image/jpeg') {
    const { description } = await post('/api/ai/describe-box', { imageBase64, mediaType })
    return description
  },

  /** Get packing tips for a room */
  async packingTips(roomName, items = []) {
    const { tips } = await post('/api/ai/packing-tips', { roomName, items })
    return tips
  },

  /** Suggest a short label from box contents */
  async suggestLabel(contents, roomName) {
    const { label } = await post('/api/ai/suggest-label', { contents, roomName })
    return label
  },

  /** Check if AI backend is reachable */
  async isAvailable() {
    try {
      const res = await fetch(`${API_BASE}/api/ai/packing-tips`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(3000) })
      return res.status !== 0
    } catch { return false }
  },
}
