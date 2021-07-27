import { keccak256, soliditySha3 } from '../lib/web3-utils'
import { bigNum } from '../lib/math-utils'

export const OUTCOMES = {
  Missing: 0,
  Leaked: 1,
  Refused: 2,
  Against: 3,
  InFavor: 4,
}

const VALID_OUTCOMES = [OUTCOMES.Refused, OUTCOMES.Against, OUTCOMES.InFavor]

export const VOTE_OPTION_REFUSE = OUTCOMES.Refused
export const VOTE_OPTION_AGAINST = OUTCOMES.Against
export const VOTE_OPTION_IN_FAVOR = OUTCOMES.InFavor
export const NOBODY_APPEALED = 'Nobody appealed'
export const NOBODY_CONFIRMED = 'No confirmation'

function getVoteTexts(outcome, options) {
  if(outcome === VOTE_OPTION_IN_FAVOR && options?.inFavorText) {
    return options.inFavorText
  }
  if(outcome === VOTE_OPTION_AGAINST && options?.againstText) {
    return options.againstText
  }
  return null;
}

const voteOptionStringMapping = {
  [VOTE_OPTION_REFUSE]: 'REFUSE TO VOTE',
  [VOTE_OPTION_AGAINST]: 'BLOCK ACTION',
  [VOTE_OPTION_IN_FAVOR]: 'ALLOW ACTION',
}

export function voteOptionToString(outcome, options) {
  return getVoteTexts(outcome, options) || voteOptionStringMapping[outcome]
}

const appealOptionStringMapping = {
  [VOTE_OPTION_REFUSE]: 'Refuse',
  [VOTE_OPTION_AGAINST]: 'Block action',
  [VOTE_OPTION_IN_FAVOR]: 'Allow action',
}

export function appealOptionToString(outcome, options) {
  return getVoteTexts(outcome, options) || appealOptionStringMapping[outcome]
}

const outcomeStringMapping = {
  [OUTCOMES.Leaked]: 'Invalid decision',
  [OUTCOMES.Refused]: 'Refused to vote',
  [OUTCOMES.Against]: 'Blocked action',
  [OUTCOMES.InFavor]: 'Allowed action',
}

export function juryOutcomeToString(outcome, options) {
  if (!outcome) {
    return outcomeStringMapping[OUTCOMES.Refused]
  }
  return getVoteTexts(outcome, options) || outcomeStringMapping[outcome]
}

const appealRulingStringMapping = {
  [OUTCOMES.Leaked]: 'Invalid decision',
  [OUTCOMES.Refused]: 'Refused',
  [OUTCOMES.Against]: 'Blocked action',
  [OUTCOMES.InFavor]: 'Allowed action',
}

export function appealRulingToString(outcome, confirm, options) {
  if (!outcome) {
    return confirm ? NOBODY_CONFIRMED : NOBODY_APPEALED
  }
  return getVoteTexts(outcome, options) || appealRulingStringMapping[outcome]
}

const finalRulingStringMapping = {
  [OUTCOMES.Leaked]: 'Invalid decision',
  [OUTCOMES.Refused]: 'Refused',
  [OUTCOMES.Against]: 'Blocked action',
  [OUTCOMES.InFavor]: 'Allowed action',
}

export function finalRulingToString(outcome, options) {
  if (!outcome) {
    return finalRulingStringMapping[OUTCOMES.refused]
  }
  return getVoteTexts(outcome, options) || finalRulingStringMapping[outcome]
}

/**
 *
 * @param {String} outcome String representation of the outcome
 * @returns {Number} corresponding outcome number
 */
export function getOutcomeNumber(outcome) {
  return OUTCOMES[outcome]
}

/**
 *
 * @param {bytes} commitment vote commitment
 * @param {bytes} password password used to get the commitment
 * @returns {Number} outcome
 */
export function getOutcomeFromCommitment(commitment, password) {
  return VALID_OUTCOMES.find(
    option => hashVote(option, password) === commitment
  )
}

/**
 * returns all possible appeal ruling options
 * @param {Number} currentOutcome current round outcome
 * @param {Object} options vote texts
 * @returns {Array} Array of appeal ruling options
 */
export function getAppealRulingOptions(currentOutcome = OUTCOMES.Refused, options) {
  return VALID_OUTCOMES.filter(
    outcome => outcome !== currentOutcome
  ).map(outcome => ({ outcome, description: appealOptionToString(outcome, options) }))
}

export function filterByValidOutcome(totalValidOutcomes) {
  return VALID_OUTCOMES.map(outcomeFilter => {
    return {
      outcomes: totalValidOutcomes.filter(
        ({ outcome }) => outcome === outcomeFilter
      ),
      outcome: outcomeFilter,
    }
  })
}

export function getVoteId(disputeId, roundId) {
  return bigNum(2)
    .pow(bigNum(128))
    .mul(bigNum(disputeId))
    .add(bigNum(roundId))
}

export function hashPassword(password) {
  return keccak256(password)
}

export function hashVote(outcome, password) {
  return soliditySha3(['uint8', 'bytes32'], [outcome, hashPassword(password)])
}

/**
 *
 * @param {Number} outcome vote outcome
 * @returns {Boolean} True if outcome is valid
 */
export function isValidOutcome(outcome) {
  return (
    VALID_OUTCOMES[0] <= outcome &&
    outcome <= VALID_OUTCOMES[VALID_OUTCOMES.length - 1]
  )
}

export function isvoteLeaked(outcome) {
  if (!outcome) return false

  return outcome === OUTCOMES.Leaked
}

export function getTotalOutcomeWeight(outcomes) {
  return outcomes.reduce((acc, { weight }) => acc + weight, 0)
}

// Local storage helper functions

// One time codes
export function saveCodeInLocalStorage(
  connectedAccount,
  disputeId,
  oneTimeCode
) {
  localStorage.setItem(
    `oneTimeCode:${connectedAccount}:${disputeId}`,
    oneTimeCode
  )
}

export function getCodeFromLocalStorage(connectedAccount, disputeId) {
  return localStorage.getItem(`oneTimeCode:${connectedAccount}:${disputeId}`)
}

export function removeCodeFromLocalStorage(connectedAccount, disputeId) {
  localStorage.removeItem(`oneTimeCode:${connectedAccount}:${disputeId}`)
}

// Auto reveal service preference
export function getAutoRevealPreference(connectedAccount, voteId) {
  // Auto reveal preference can be either 'true' or 'false'
  return (
    localStorage.getItem(`autoRevealService:${connectedAccount}:${voteId}`) ===
    'true'
  )
}

export function saveAutoRevealPreference(connectedAccount, voteId, enabled) {
  localStorage.setItem(
    `autoRevealService:${connectedAccount}:${voteId}`,
    enabled
  )
}
