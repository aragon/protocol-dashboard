import { useEffect, useState } from 'react'
import { getProfileForAccount } from '../lib/profile'

const addressCache = new Map()

export default function useProfileName(account) {
  const [profileName, setProfileName] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchProfile() {
      if (addressCache.get(account)) {
        setProfileName(addressCache.get(account))
        return
      }
      const profile = await getProfileForAccount(account)
      if (profile && !cancelled) {
        setProfileName(profile.name)
        addressCache.set(account, profile.name)
      }
    }

    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [account])

  return profileName
}
