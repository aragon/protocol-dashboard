import {
  ANTMovement as antMovementTypes,
  ANTBalance as antBalanceTypes,
  movementDirection,
  STAKE_ACTIVATION_MOVEMENT,
} from '../types/ant-types'
import { bigNum } from '../lib/math-utils'

/**
 * Function intended to group Stake and Activation movements that were created at the same time
 *  into one StakeActivation movement
 * This is needed since moving ANT from wallet to Active Balance, two movements
 *  are performed (Wallet (stake) => InactiveBalance; Inactive balance (activate) => Active balance)
 * @param {Array} movements Array of original movements
 * @returns {Array} Resuling array of movements grouped by the logic described above
 */
export const groupMovements = movements => {
  // If the guardian is activating from the wallet we need to just show an incoming movement in the Active balance
  // and an outgoing movement in the Wallet balance
  return movements.reduce(
    (movements, currentMovement, index, prevMovements) => {
      const prevMovement = prevMovements[index - 1]

      if (
        index > 0 &&
        antMovementTypes[prevMovement.type] === antMovementTypes.Activation &&
        antMovementTypes[currentMovement.type] === antMovementTypes.Stake &&
        prevMovement.createdAt === currentMovement.createdAt
      ) {
        movements[movements.length - 1].type = STAKE_ACTIVATION_MOVEMENT
        return movements
      }

      movements.push({
        ...currentMovement,
        effectiveTermId: currentMovement.effectiveTermId
          ? parseInt(currentMovement.effectiveTermId, 10)
          : null,
        amount: bigNum(currentMovement.amount),
      })

      return movements
    },
    []
  )
}

// The intention here is to know which movements types should correspond with each balance
export const acceptedMovementsPerBalance = new Map([
  [
    antBalanceTypes.Wallet,
    [
      { type: antMovementTypes.Stake, direction: movementDirection.Outgoing },
      { type: antMovementTypes.Unstake, direction: movementDirection.Incoming },
      {
        type: antMovementTypes.StakeActivation,
        direction: movementDirection.Outgoing,
      },
    ],
  ],
  [
    antBalanceTypes.Inactive,
    [
      { type: antMovementTypes.Stake, direction: movementDirection.Incoming },
      { type: antMovementTypes.Unstake, direction: movementDirection.Outgoing },
      { type: antMovementTypes.Reward, direction: movementDirection.Incoming },
      {
        type: antMovementTypes.Activation,
        direction: movementDirection.Outgoing,
      },
      {
        type: antMovementTypes.Deactivation,
        direction: movementDirection.Incoming,
      },
    ],
  ],
  [
    antBalanceTypes.Active,
    [
      {
        type: antMovementTypes.StakeActivation,
        direction: movementDirection.Incoming,
      },
      {
        type: antMovementTypes.Activation,
        direction: movementDirection.Incoming,
      },
      {
        type: antMovementTypes.Deactivation,
        direction: movementDirection.Outgoing,
      },
      {
        type: antMovementTypes.DeactivationProcess,
        direction: movementDirection.Locked,
      },
      { type: antMovementTypes.Lock, direction: movementDirection.Locked },
      { type: antMovementTypes.Unlock, direction: movementDirection.Incoming },
      { type: antMovementTypes.Slash, direction: movementDirection.Outgoing },
    ],
  ],
])

export function isMovementOf(movements, movementType) {
  return movements.some(movement => movement.type === movementType)
}

/**
 * Gets the direction of a movement [Incoming, Outgoing, Locked]
 * @param {Array} acceptedMovements Array of movements accepted for `movementType`
 * @param {Symbol} movementType type of movement
 * @returns {Symbol} The direction of the movement
 */
export function getMovementDirection(acceptedMovements, movementType) {
  const { direction } = acceptedMovements.find(
    elem => elem.type === movementType
  )

  return direction
}

/**
 * Tells whether a movement is effective or not
 * @param {Object} movement Movement to check effectiveness of
 * @param {Number} currentTermId Id of the current term
 * @returns {Boolean} True if the movement is effective
 */
export function isMovementEffective(movement, currentTermId) {
  if (!movement.effectiveTermId) return true

  return movement.effectiveTermId <= currentTermId
}

export function getAmountNotEffectiveByMovement(movements, movementType) {
  return movements
    .filter(
      mov => !mov.isEffective && antMovementTypes[mov.type] === movementType
    )
    .reduce((acc, mov) => acc.add(mov.amount), bigNum(0))
}

/**
 * Gets the total amount not yet effective for a given type of balance
 * @param {Array} movements Array of movements to get the total not effective from
 * @param {Symbol} balanceType Type of balance [Wallet, Inactive, Active]
 * @returns {BigNum} Total amount not yet effective
 */
export function getAmountNotEffectiveByBalance(movements, balanceType) {
  // We need to calulate the total not effective amount for the active and inactive balance
  // Note that we don't do this for the wallet balance since all its corresponding movements are done effective inmediately
  // Note that this assumes the termDuration is less than 24hrs
  if (balanceType === antBalanceTypes.Wallet) {
    return bigNum(0)
  }

  const movementType =
    balanceType === antBalanceTypes.Active
      ? antMovementTypes.Activation
      : antMovementTypes.Deactivation

  return getAmountNotEffectiveByMovement(movements, movementType)
}

/**
 * gets the latest movement depending on the type of balance
 * @dev Note that for the Active balance, if there are deactivation requests not yet effective
 * we must give them priority over the rest
 *
 * @param {Array} movements Array of movements to get the latest from
 * @param {Symbol} balanceType Type of balance [Wallet, Inactive, Active]
 * @returns {Object} Latest movement (if any) relative to the type of balance
 */
export function getLatestMovementByBalance(movements, balanceType) {
  if (!movements.length) {
    return null
  }

  // We have to give a special treatment to the active balance since
  // deactivation requests that are not yet effective have more priority than the rest
  if (balanceType === antBalanceTypes.Active) {
    const totalDeactivationsNotEffective = getAmountNotEffectiveByMovement(
      movements,
      antMovementTypes.Deactivation
    )

    if (totalDeactivationsNotEffective.gt(0)) {
      return {
        amount: totalDeactivationsNotEffective,
        type: antMovementTypes.DeactivationProcess,
      }
    }
  }

  // Get the latest movement
  let latestMovement = movements[0]
  const latestMovementType = antMovementTypes[latestMovement.type]

  // If the latest movement for the active or inactive balance is a deactivation, we must check that the deactivation is effective
  if (latestMovementType === antMovementTypes.Deactivation) {
    if (
      balanceType === antBalanceTypes.Inactive &&
      !latestMovement.isEffective
    ) {
      // In case the deactivation is not effective, we'll get the most recent effective or immediate movement for the inactive balance
      // Note that the array is orderer by most recent desc
      latestMovement = movements.find(
        movement => movement.isEffective || movement.isImmediate
      )

      if (
        !latestMovement ||
        antMovementTypes[latestMovement.type] !== antMovementTypes.Deactivation
      ) {
        return latestMovement
      }
    }

    // We get here if all this conditions are given
    // - Latest movement is a Deactivation
    // - Latest movement is Effective
    // - We are calculating latest movement for Active or Inactive balance

    // In all these cases, we need to get all deactivations
    // done effective on the same term as this latest movement
    return {
      ...latestMovement,
      amount: getTotalEffectiveAt(
        movements,
        antMovementTypes.Deactivation,
        latestMovement.effectiveTermId
      ),
    }
  }

  return latestMovement
}

/**
 * Calculates the aggregated effective movements amount at term `termId`
 * @param {Array} movements Array of movements
 * @param {Symbol} movementType Type of movement
 * @param {Number} termId Id of the term
 * @returns {BigNum} Total effective movements amount at `termId`
 */
function getTotalEffectiveAt(movements, movementType, termId) {
  return movements
    .filter(
      movement =>
        antMovementTypes[movement.type] === movementType &&
        movement.effectiveTermId === termId
    )
    .reduce((acc, movement) => acc.add(movement.amount), bigNum(0))
}

export function convertMovement(acceptedMovements, movement) {
  if (!movement) return null

  const movementType =
    typeof movement.type === 'symbol'
      ? movement.type
      : antMovementTypes[movement.type]

  const direction = getMovementDirection(acceptedMovements, movementType)

  return {
    type: movementType,
    amount: movement.amount,
    direction,
  }
}

export function getUpdatedLockedMovement(lockedBalance, latestMovement) {
  if (!lockedBalance || lockedBalance.eq(0)) {
    return latestMovement
  }

  // In the case that the guardian has locked balance, we must update the active balance latest movement
  const movementTypeLock = antMovementTypes.Lock
  let newLockedAmount = lockedBalance

  // If active balance latest movement is a deactivation process, we must update the amount
  if (latestMovement?.type === antMovementTypes.DeactivationProcess) {
    newLockedAmount = newLockedAmount.add(latestMovement.amount)
  }

  return {
    ...latestMovement,
    amount: newLockedAmount,
    type: movementTypeLock,
  }
}
