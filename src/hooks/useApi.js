import { useState, useCallback } from 'react'

const API_BASE    = 'https://www.urusverify.com/v1/client/bfce9231-63b4-4c0e-a369-4f484f044096/api'
const FACTORY_KEY = 'factory2026'

/**
 * Build default headers for every request.
 * Merges caller-supplied headers last so they can override defaults.
 */
function buildHeaders(customHeaders = {}) {
  return {
    'Content-Type':  'application/json',
    'x-factory-key': FACTORY_KEY,
    ...customHeaders
  }
}

/**
 * Core fetch wrapper.
 * @param {string} endpoint  - Path relative to API_BASE, e.g. "/users"
 * @param {RequestInit} options - Standard fetch options (method, body, headers, …)
 * @returns {Promise<{ data: any, error: string|null, status: number }>}
 */
export async function fetchApi(endpoint, options = {}) {
  const { headers: customHeaders, body, ...rest } = options

  const config = {
    method: 'GET',
    ...rest,
    headers: buildHeaders(customHeaders)
  }

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const message =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        `HTTP error ${response.status}`
      return { data: null, error: message, status: response.status }
    }

    return { data, error: null, status: response.status }
  } catch (err) {
    return {
      data:   null,
      error:  err?.message ?? 'Network error',
      status: 0
    }
  }
}

/**
 * React hook that wraps fetchApi with loading / error state.
 *
 * const { request, data, loading, error } = useApi()
 * await request('/users', { method: 'POST', body: payload })
 */
export function useApi() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [status,  setStatus]  = useState(null)

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)

    const result = await fetchApi(endpoint, options)

    setData(result.data)
    setError(result.error)
    setStatus(result.status)
    setLoading(false)

    return result
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setStatus(null)
    setLoading(false)
  }, [])

  return { request, reset, data, loading, error, status }
}