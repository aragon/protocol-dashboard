import actions from '../../actions/court-action-types'

import {
  ICON_ACTIVITY_HNY,
  ICON_ACTIVITY_LOGO,
  ICON_APPEAL_ACTIVE,
  ICON_REWARDS_ACTIVE,
  ICON_RULING_ACTIVE,
  ICON_USERS_ACTIVE,
  ICON_VOTING_ACTIVE,
} from '../../utils/asset-utils'

// The different types of activity
const ACTIVITY_TYPES = {
  [actions.APPROVE_ACTIVATION_AMOUNT]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Approve activation amount',
  },
  [actions.APPROVE_FEE_DEPOSIT]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Approve fee deposit',
  },
  [actions.ACTIVATE_HNY]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Activate HNY',
  },
  [actions.APPEAL_RULING]: {
    title: 'Appeal ruling',
    icon: ICON_APPEAL_ACTIVE,
  },
  [actions.CLAIM_REWARDS]: {
    title: 'Claim rewards',
    icon: ICON_REWARDS_ACTIVE,
  },
  [actions.CLAIM_SUBSCRIPTION_FEES]: {
    title: 'Claim Subscription rewards',
    icon: ICON_REWARDS_ACTIVE,
  },
  [actions.COMMIT_VOTE]: {
    title: 'Commit vote',
    icon: ICON_VOTING_ACTIVE,
  },
  [actions.CONFIRM_APPEAL]: {
    title: 'Confirm appeal',
    icon: ICON_APPEAL_ACTIVE,
  },
  [actions.DEACTIVATE_HNY]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Deactivate HNY',
  },
  [actions.DRAFT_JURY]: {
    title: 'Draft keepers',
    icon: ICON_USERS_ACTIVE,
  },
  [actions.EXECUTE_RULING]: {
    title: 'Execute ruling',
    icon: ICON_RULING_ACTIVE,
  },
  [actions.HEARTBEAT]: {
    title: 'Update term',
    icon: ICON_ACTIVITY_LOGO,
  },
  [actions.LEAK_VOTE]: {
    title: 'Leak vote',
    icon: ICON_VOTING_ACTIVE,
  },
  [actions.REVEAL_VOTE]: {
    title: 'Reveal vote',
    icon: ICON_ACTIVITY_HNY,
  },
  [actions.SETTLE_REWARD]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Settle reward',
  },
  [actions.SETTLE_APPEAL_DEPOSIT]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Settle appeal deposit',
  },
  [actions.WITHDRAW_HNY]: {
    icon: ICON_ACTIVITY_HNY,
    title: 'Withdraw HNY',
  },
}

export function getActivityData(type) {
  return ACTIVITY_TYPES[type]
}
