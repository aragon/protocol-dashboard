import actions from '../../actions/court-action-types'

import {
  ICON_APPEAL_ACTIVE,
  ICON_REWARDS_ACTIVE,
  ICON_RULING_ACTIVE,
  ICON_USERS_ACTIVE,
  ICON_VOTING_ACTIVE,
} from '../../utils/asset-utils'

import iconHny from './assets/activity-icon-hny.svg'
import iconCelesteLogo from './assets/activity-icon-celeste-logo.svg'

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
    icon: iconHny,
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
    icon: iconCelesteLogo,
  },
  [actions.LEAK_VOTE]: {
    title: 'Leak vote',
    icon: ICON_VOTING_ACTIVE,
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
