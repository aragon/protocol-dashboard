import actions from '../../actions/court-action-types'

import iconHny from './assets/activity-icon-hny.svg'
import iconAppealRuling from './assets/activity-icon-appeal-ruling.svg'
import iconClaimRewards from './assets/activity-icon-claim-rewards.svg'
import iconCommitVote from './assets/activity-icon-commit-vote.svg'
import iconCelesteLogo from './assets/activity-icon-celeste-logo.svg'
import iconDraftJury from './assets/activity-icon-draft-jury.svg'
import iconExecuteRuling from './assets/activity-icon-execute-ruling.svg'

// The different types of activity
const ACTIVITY_TYPES = {
  [actions.APPROVE_ACTIVATION_AMOUNT]: {
    icon: iconHny,
    title: 'Approve activation amount',
  },
  [actions.APPROVE_FEE_DEPOSIT]: {
    icon: iconHny,
    title: 'Approve fee deposit',
  },
  [actions.ACTIVATE_HNY]: {
    icon: iconHny,
    title: 'Activate HNY',
  },
  [actions.APPEAL_RULING]: {
    title: 'Appeal ruling',
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
  [actions.DEACTIVATE_HNY]: {
    icon: iconHny,
    title: 'Deactivate HNY',
  },
  [actions.DRAFT_JURY]: {
    title: 'Draft keepers',
    icon: iconDraftJury,
  },
  [actions.EXECUTE_RULING]: {
    title: 'Execute ruling',
    icon: iconExecuteRuling,
  },
  [actions.HEARTBEAT]: {
    title: 'Update term',
    icon: iconCelesteLogo,
  },
  [actions.LEAK_VOTE]: {
    title: 'Leak vote',
    icon: iconCommitVote,
  },
  [actions.REVEAL_VOTE]: {
    title: 'Reveal vote',
    icon: iconHny,
  },
  [actions.SETTLE_REWARD]: {
    icon: iconHny,
    title: 'Settle reward',
  },
  [actions.SETTLE_APPEAL_DEPOSIT]: {
    icon: iconHny,
    title: 'Settle appeal deposit',
  },
  [actions.WITHDRAW_HNY]: {
    icon: iconHny,
    title: 'Withdraw HNY',
  },
}

export function getActivityData(type) {
  return ACTIVITY_TYPES[type]
}
