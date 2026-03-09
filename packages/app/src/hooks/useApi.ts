import { useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../api/client'

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()
  return useMemo(
    () => createApiClient(() => getAccessTokenSilently()),
    [getAccessTokenSilently]
  )
}
