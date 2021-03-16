import {
  voteOptionToString,
  appealOptionToString,
} from './utils/crvoting-utils'
import { numberToWord } from './lib/math-utils'
import actions from './actions/court-action-types'

export default {
  [actions.APPROVE_FEE_DEPOSIT]: ({ amount }) => {
    return `Approve fee deposit: ${amount} DAI`
  },
  [actions.ACTIVATE_ANT]: ({ amount }) => {
    return `Activate the total amount of ${amount} ANT`
  },
  [actions.APPEAL_RULING]: ({ disputeId, roundId, ruling }) => {
    return `Appeal round ${numberToWord(
      roundId
    )} of dispute #${disputeId} in favor of decision: ${appealOptionToString(
      ruling
    )}`
  },
  [actions.CLAIM_REWARDS]: ({ amount }) => {
    return `Claim rewards for a total amount of ${amount} DAI`
  },
  [actions.CLAIM_SUBSCRIPTION_FEES]: ({ periodId }) => {
    return `Claim subscription rewards for period ${periodId}`
  },
  [actions.COMMIT_VOTE]: ({ disputeId, roundId, outcome }) => {
    return `Vote ${voteOptionToString(outcome)} on round ${numberToWord(
      roundId
    )} of dispute #${disputeId}`
  },
  [actions.CONFIRM_APPEAL]: ({ disputeId, roundId, ruling }) => {
    return `
        Confirm appeal round ${numberToWord(
          roundId
        )} of dispute #${disputeId} in favor of
        decision: ${appealOptionToString(ruling)}
      `
  },
  [actions.DEACTIVATE_ANT]: ({ amount }) => {
    return `
        Deactivate the total amount of ${amount} ANT
      `
  },
  [actions.DRAFT_JURY]: ({ disputeId }) => {
    return `
        Summon guardians for the next round of dispute #${disputeId}
      `
  },
  [actions.EXECUTE_RULING]: ({ disputeId }) => {
    return `
        Compute the final decision for dispute #${disputeId}
      `
  },
  [actions.HEARTBEAT]: ({ transitions }) => {
    return `
        Transition ${transitions} court term${transitions > 1 ? 's' : ''}
      `
  },
  [actions.LEAK_VOTE]: ({ voteId, voter }) => {
    return `
        Report code leaked by ${voter} for vote #${voteId}
      `
  },
  [actions.REVEAL_VOTE]: ({ disputeId, roundId }) => {
    return `
        Reveal vote on round ${numberToWord(roundId)} for dispute #${disputeId}
      `
  },
  [actions.SETTLE_REWARD]: ({ roundId, disputeId }) => {
    return `
        Settle reward for round ${numberToWord(
          roundId
        )} of dispute #${disputeId}
      `
  },
  [actions.SETTLE_APPEAL_DEPOSIT]: ({ roundId, disputeId }) => {
    return `
        Settle appeal deposit for round ${numberToWord(
          roundId
        )} of dispute #${disputeId}
      `
  },
  [actions.WITHDRAW_ANT]: ({ amount }) => {
    return `
        Withdraw the total amount of ${amount} ANT
      `
  },
}
