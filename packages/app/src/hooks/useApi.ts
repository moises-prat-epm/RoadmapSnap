import { useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../api/client'

const TOKEN_TIMEOUT_MS = 15_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Token request timed out')), ms)
    ),
  ])
}

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()
  return useMemo(
    () =>
      createApiClient(() =>
        withTimeout(getAccessTokenSilently(), TOKEN_TIMEOUT_MS)
      ),
    [getAccessTokenSilently]
  )
}
