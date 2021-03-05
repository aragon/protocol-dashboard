import { getProfile } from '3box'

export async function getProfileForAccount(account) {
  if (!account) {
    return null
  }

  const profile = await getProfile(account)
  return profile
}
