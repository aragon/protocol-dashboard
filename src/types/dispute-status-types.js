export const ERROR_TYPES = {
  ERROR_FETCHING_IPFS: Symbol('Error fetching ipfs content'),
}

export const Status = {
  Open: Symbol('Open'),
  Closed: Symbol('Closed'),
  Voided: Symbol('Voided'),
}

export const Phase = {
  All: Symbol('All'),
  Invalid: Symbol('Invalid'),
  Adjudicating: Symbol('Adjudicating'),
  Ruled: Symbol('Ruled'),
  Evidence: Symbol('Evidence submission'),
  NotStarted: Symbol('Not started'),
  GuardianDrafting: Symbol('Guardian drafting'),
  VotingPeriod: Symbol('Voting period'),
  RevealVote: Symbol('Reveal vote'),
  AppealRuling: Symbol('Appealing'),
  ConfirmAppeal: Symbol('ConfirmingAppeal'),
  ClaimRewards: Symbol('Claim rewards'),
  Ended: Symbol('Ended'),
  ExecuteRuling: Symbol('Execute Ruling'),
  Created: Symbol('Dispute created'),
}

const stringMapping = {
  [Status.Open]: 'Open',
  [Status.Closed]: 'Closed',
  [Phase.All]: 'All',
  [Phase.Evidence]: 'Adding arguments',
  [Phase.GuardianDrafting]: 'Summon guardians',
  [Phase.NotStarted]: 'Starts in',
  [Phase.VotingPeriod]: 'Voting period',
  [Phase.RevealVote]: 'Reveal vote',
  [Phase.AppealRuling]: 'Appeal decision',
  [Phase.ConfirmAppeal]: 'Confirm appeal',
  [Phase.ClaimRewards]: 'Claim rewards',
  [Phase.Invalid]: 'Invalid',
  [Phase.Ended]: 'Ended',
  [Phase.ExecuteRuling]: 'Enact Decision',
  [Phase.Created]: 'Dispute created',
}

const endedStringMapping = {
  [Status.Open]: 'Open',
  [Status.Closed]: 'Closed',
  [Phase.All]: 'All',
  [Phase.Evidence]: 'Arguments added',
  [Phase.GuardianDrafting]: 'Guardians summoned',
  [Phase.VotingPeriod]: 'Voting period',
  [Phase.RevealVote]: 'Vote revealed',
  [Phase.AppealRuling]: 'Appeal decision',
  [Phase.ConfirmAppeal]: 'Appeal confirmed',
  [Phase.ClaimRewards]: 'Claim rewards',
  [Phase.Invalid]: 'Started',
  [Phase.Ended]: 'Ended',
  [Phase.ExecuteRuling]: 'Decision Enacted',
  [Phase.Created]: 'Dispute created',
}

const symbolMapping = {
  All: Phase.All,
  Invalid: Phase.Invalid,
  Committing: Phase.VotingPeriod,
  Revealing: Phase.RevealVote,
  Drafting: Phase.GuardianDrafting,
  Adjudicating: Phase.Adjudicating,
  Appeal: Phase.AppealRuling,
  ConfirmAppeal: Phase.ConfirmAppeal,
  ConfirmingAppeal: Phase.ConfirmAppeal,
  Ruled: Phase.Ruled,
  Evidence: Phase.Evidence,
  ExecuteRuling: Phase.ExecuteRuling,
  Created: Phase.Created,
}

const taskActionsMapping = {
  [Phase.All]: 'All',
  [Phase.VotingPeriod]: 'Commit vote',
  [Phase.RevealVote]: 'Reveal vote',
  [Phase.AppealRuling]: 'Appeal decision',
  [Phase.ConfirmAppeal]: 'Confirm appeal',
}

export function convertFromString(str) {
  return symbolMapping[str]
}

export function convertToString(symbol) {
  return stringMapping[symbol]
}

export function getPhaseStringForStatus(symbol, active) {
  if (active) {
    return stringMapping[symbol]
  } else {
    return endedStringMapping[symbol]
  }
}

export function getTaskActionString(symbol) {
  return taskActionsMapping[symbol]
}
