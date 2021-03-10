import actions from '../../actions/court-action-types'

import iconANT from './assets/activity-icon-ant.svg' 
import iconAppealRuling from './assets/activity-icon-appeal-ruling.svg'
import iconClaimRewards from './assets/activity-icon-claim-rewards.svg'
import iconCommitVote from './assets/activity-icon-commit-vote.svg'
import iconCourtLogo from './assets/activity-icon-court-logo.svg'
import iconDraftJury from './assets/activity-icon-draft-jury.svg'
import iconExecuteRuling from './assets/activity-icon-execute-ruling.svg'

// The different types of activity
const ACTIVITY_TYPES = {
  [actions.APPROVE_FEE_DEPOSIT]: {
    icon: iconANT,
    title: 'Approve fee deposit',
  },
  [actions.ACTIVATE_ANT]: {
    icon: iconANT,
    title: 'Activate ANT',
  },
  [actions.APPEAL_RULING]: {
    title: 'Appeal decision',
    icon: iconAppealRuling,
  },
  [actions.CLAIM_REWARDS]: {
    title: 'Claim rewards',
    icon: iconClaimRewards,
  },
  [actions.CLAIM_SUBSCRIPTION_FEES]: {
    title: 'Claim Subscription rewards',
    icon: iconClaimRewards,
  },
  [actions.COMMIT_VOTE]: {
    title: 'Commit vote',
    icon: iconCommitVote,
  },
  [actions.CONFIRM_APPEAL]: {
    title: 'Confirm appeal',
    icon: iconAppealRuling,
  },
  [actions.DEACTIVATE_ANT]: {
    icon: iconANT,
    title: 'Deactivate ANT',
  },
  [actions.DRAFT_JURY]: {
    title: 'Summon guardians',
    icon: iconDraftJury,
  },
  [actions.EXECUTE_RULING]: {
    title: 'Enact decision',
    icon: iconExecuteRuling,
  },
  [actions.HEARTBEAT]: {
    title: 'Update term',
    icon: iconCourtLogo,
  },
  [actions.LEAK_VOTE]: {
    title: 'Leak vote',
    icon: iconCommitVote,
  },
  [actions.REVEAL_VOTE]: {
    title: 'Reveal vote',
    icon: iconANT,
  },
  [actions.SETTLE_REWARD]: {
    icon: iconANT,
    title: 'Settle reward',
  },
  [actions.SETTLE_APPEAL_DEPOSIT]: {
    icon: iconANT,
    title: 'Settle appeal deposit',
  },
  [actions.WITHDRAW_ANT]: {
    icon: iconANT,
    title: 'Withdraw ANT',
  },
}

export function getActivityData(type) {
  return ACTIVITY_TYPES[type]
}
