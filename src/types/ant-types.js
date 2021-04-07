export const STAKE_ACTIVATION_MOVEMENT = 'StakeActivation'

export const ANTMovement = {
  Stake: Symbol('STAKE'),
  Unstake: Symbol('UNSTAKE'),
  Activation: Symbol('ACTIVATION'),
  [STAKE_ACTIVATION_MOVEMENT]: Symbol('StakeActivation'),
  Deactivation: Symbol('DEACTIVATION'),
  DeactivationProcess: Symbol('DEACTIVATION_PROCESS'),
  Lock: Symbol('LOCK'),
  Unlock: Symbol('UNLOCK'),
  Reward: Symbol('REWARD'),
  Slash: Symbol('SLASH'),
}

export const movementDirection = {
  Incoming: Symbol('INCOMING_MOVEMENT'),
  Outgoing: Symbol('OUTGOING_MOVEMENT'),
  Locked: Symbol('LOCKED_MOVEMENT'),
}

const stringMapping = {
  [ANTMovement.Stake]: {
    [movementDirection.Incoming]: 'Deposit',
    [movementDirection.Outgoing]: 'Withdrawal',
  },
  [ANTMovement.Unstake]: {
    [movementDirection.Incoming]: 'Deposit',
    [movementDirection.Outgoing]: 'Withdrawal',
  },
  [ANTMovement.Activation]: 'Activated',
  [ANTMovement.StakeActivation]: 'Activated',
  [ANTMovement.Deactivation]: 'Deactivated',
  [ANTMovement.DeactivationProcess]: 'Deactivation process',
  [ANTMovement.Lock]: 'Locked',
  [ANTMovement.Unlock]: 'Unlocked',
  [ANTMovement.Reward]: 'Rewards',
  [ANTMovement.Slash]: 'Slashed',
}

export function convertToString(symbol, direction) {
  const mapping = stringMapping[symbol]
  return typeof mapping === 'object' ? mapping[direction] : mapping
}

export const ANTBalance = {
  Wallet: Symbol('WALLET'),
  Inactive: Symbol('INACTIVE'),
  Active: Symbol('ACTIVE'),
}
