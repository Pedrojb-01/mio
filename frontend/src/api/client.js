const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

async function request(method, path, body = null) {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body !== null) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Unexpected error. Please try again.',
    }))
    throw new AppError(error.message, response.status)
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
}