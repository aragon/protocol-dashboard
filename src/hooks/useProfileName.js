import { useState } from 'react'

export default function useProfileName(account) {
  const [profileName] = useState(null)
  // 3box removed, deprecated libs
  return profileName
}
