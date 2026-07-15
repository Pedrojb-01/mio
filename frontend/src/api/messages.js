import { api } from './client.js'

// SSE streaming — can't use EventSource because it doesn't support
// POST requests or cookies. We use fetch + ReadableStream instead.
export function streamMessage({ sessionId, content, onChunk, onTitle, onDone, onError }) {
  const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'

  fetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: content }),
  })
    .then(async response => {
      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          return
        }
        const err = await response.json().catch(() => ({ message: 'Unexpected error.' }))
        onError(err.message)
        return
      }

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode chunk and accumulate in buffer
        // (a single chunk may contain multiple SSE lines or a partial one)
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        // Keep last incomplete line in buffer
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') { onDone(); return }
          try {
            const parsed = JSON.parse(payload)
            if (parsed.title) { onTitle(parsed.title); continue }  // ← continue, não return
            if (parsed.text)  { onChunk(parsed.text);  continue } 
          } catch { /* malformed chunk — skip */ }
        }
      }
    })
    .catch(() => onError('Connection error. Please try again.'))
}