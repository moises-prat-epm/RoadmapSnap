import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError, createApiClient } from './client'

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('throws ApiError when fetch returns a non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      })
    )

    // Client validates JWT shape (three segments) before fetch; use a dummy JWT-shaped string.
    const client = createApiClient(() => Promise.resolve('header.payload.signature'))

    await expect(client.getWorkspaces()).rejects.toThrow(ApiError)
    await expect(client.getWorkspaces()).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    })
  })
})
