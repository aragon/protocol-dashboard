export const STAKE_ACTIVATION_MOVEMENT = 'StakeActivation'

export const HNYMovement = {
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
  [HNYMovement.Stake]: {
    [movementDirection.Incoming]: 'Deposit',
    [movementDirection.Outgoing]: 'Withdrawal',
  },
  [HNYMovement.Unstake]: {
    [movementDirection.Incoming]: 'Deposit',
    [movementDirection.Outgoing]: 'Withdrawal',
  },
  [HNYMovement.Activation]: 'Activated',
  [HNYMovement.StakeActivation]: 'Activated',
  [HNYMovement.Deactivation]: 'Deactivated',
  [HNYMovement.DeactivationProcess]: 'Deactivation process',
  [HNYMovement.Lock]: 'Locked',
  [HNYMovement.Unlock]: 'Unlocked',
  [HNYMovement.Reward]: 'Rewards',
  [HNYMovement.Slash]: 'Slashed',
}

export function convertToString(symbol, direction) {
  const mapping = stringMapping[symbol]
  return typeof mapping === 'object' ? mapping[direction] : mapping
}

export const HNYBalance = {
  Wallet: Symbol('WALLET'),
  Inactive: Symbol('INACTIVE'),
  Active: Symbol('ACTIVE'),
}
