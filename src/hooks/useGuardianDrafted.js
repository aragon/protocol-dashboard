import { dayjs } from '../utils/date-utils'
import { useWallet } from '../providers/Wallet'
import { useCourtClock } from '../providers/CourtClock'
import { useCurrentTermGuardianDraftsSubscription } from './subscription-hooks'

export function useGuardianDrafted({ pause }) {
  const wallet = useWallet()
  const { currentTermStartDate } = useCourtClock()

  const currnetTermStartTime = dayjs(currentTermStartDate).unix()

  const guardianDrafts = useCurrentTermGuardianDraftsSubscription(
    wallet.account,
    currnetTermStartTime,
    pause
  )

  return guardianDrafts.length > 0
}
