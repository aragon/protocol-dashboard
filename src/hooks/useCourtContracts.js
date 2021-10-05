import { useCallback, useEffect, useMemo, useState } from 'react'
import { captureException } from '@sentry/browser'
import { getNetworkConfig } from '../networks'
import { useWallet } from 'use-wallet'

// hooks
import { useCourtConfig } from '../providers/CourtConfig'
import { useActivity } from '../providers/ActivityProvider'
import { useRequestQueue } from '../providers/RequestQueue'
import { useRequestProcessor } from './useRequestProcessor'
import { useContract } from '../web3-contracts'

// services
import { requestAutoReveal as requestAutoRevealApi } from '../services/autoReveal'

// utils
import radspec from '../radspec'
import { retryMax } from '../utils/retry-max'
import actions from '../actions/court-action-types'
import { getModuleAddress } from '../utils/court-utils'
import { bigNum, formatUnits } from '../lib/math-utils'
import { CourtModuleType } from '../types/court-module-types'
import {
  getVoteId,
  hashPassword,
  hashVote,
  saveCodeInLocalStorage,
} from '../utils/crvoting-utils'

// abis
import aragonCourtAbi from '../abi/AragonCourt.json'
import courtSubscriptionsAbi from '../abi/CourtSubscriptions.json'
import courtTreasuryAbi from '../abi/CourtTreasury.json'
import disputeManagerAbi from '../abi/DisputeManager.json'
import guardianRegistryAbi from '../abi/GuardianRegistry.json'
import tokenAbi from '../abi/ERC20.json'
import votingAbi from '../abi/CRVoting.json'

const GAS_LIMIT = 1200000
const ANT_ACTIVATE_GAS_LIMIT = 500000
const ANT_ACTIONS_GAS_LIMIT = 325000

// ANT contract
export function useANTTokenContract() {
  const { token: antToken } = useCourtConfig()

  const antTokenAddress = antToken ? antToken.id : null

  return useContract(antTokenAddress, tokenAbi)
}

// Fee token contract
function useFeeTokenContract() {
  const { feeToken } = useCourtConfig()

  const feeTokenAddress = feeToken ? feeToken.id : null

  return useContract(feeTokenAddress, tokenAbi)
}

// Court contracts
function useCourtContract(moduleType, abi) {
  const { id, modules } = useCourtConfig() || {}

  let contractAddress
  if (moduleType === CourtModuleType.AragonCourt) {
    contractAddress = id
  } else {
    contractAddress = getModuleAddress(modules, moduleType)
  }

  return useContract(contractAddress, abi)
}

/**
 * All ANT interactions
 * @returns {Object} all available functions around ANT balances
 */
export function useANTActions() {
  const processRequests = useRequestProcessor()

  const wallet = useWallet()
  
  const { anjLockMinter } = getNetworkConfig()

  const guardianRegistryContract = useCourtContract(
    CourtModuleType.GuardiansRegistry,
    guardianRegistryAbi
  )
  const antTokenContract = useANTTokenContract()

  // unlockActivation handle By LockManager(ANJLockMinter) 
  const [unlockSettings, setUnlockSettings] = useState({
    canUnlock: false,
    lockedAmount: 0
  })

  useEffect(() => {
    async function getActivationLocok() {
      if(wallet.account && anjLockMinter) {
        const locks = await guardianRegistryContract.getActivationLock(wallet.account, anjLockMinter)
        const lockedAmount = locks.amount.toString()
        if(lockedAmount !== '0') {
          // means, this locker manager has some token for this guardian locked. Enable unlockActivation
          setUnlockSettings({
            canUnlock: true,
            lockedAmount: locks.amount
          })
        }
      }
    }
    getActivationLocok()
    
  }, [anjLockMinter, guardianRegistryContract, wallet.account])
  
  const unlockActivation = useCallback(
    (account, amount) => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            guardianRegistryContract.unlockActivation(account, anjLockMinter, amount, {
              gasLimit: ANT_ACTIVATE_GAS_LIMIT,
            }),
          description: radspec[actions.UNLOCK_ACTIVATION]({
            amount: formattedAmount,
          }),
          type: actions.ACTIVATE_ANT,
        },
      ])
    },
    [guardianRegistryContract, processRequests, anjLockMinter]
  )


  // console.log(wallet, ' walllt')
  // activate ANT directly from available balance
  const activateANT = useCallback(
    (account, amount) => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            guardianRegistryContract.activate(account, amount, {
              gasLimit: ANT_ACTIVATE_GAS_LIMIT,
            }),
          description: radspec[actions.ACTIVATE_ANT]({
            amount: formattedAmount,
          }),
          type: actions.ACTIVATE_ANT,
        },
      ])
    },
    [guardianRegistryContract, processRequests]
  )

  const deactivateANT = useCallback(
    (account, amount) => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            guardianRegistryContract.deactivate(account, amount, {
              gasLimit: ANT_ACTIONS_GAS_LIMIT,
            }),
          description: radspec[actions.DEACTIVATE_ANT]({
            amount: formattedAmount,
          }),
          type: actions.DEACTIVATE_ANT,
        },
      ])
    },
    [guardianRegistryContract, processRequests]
  )

  // approve, stake and activate ANT
  const stakeActivateANT = useCallback(
    (account, amount) => {
      const formattedAmount = formatUnits(amount)
      
      const requestQueue = [
        {
          action: () =>
          antTokenContract.approve(guardianRegistryContract.address, amount, { gasLimit: ANT_ACTIVATE_GAS_LIMIT }),
          description: radspec[actions.APPROVE_ANT]({ amount: formattedAmount }),
          type: actions.APPROVE_ANT,
          ensureConfirmation: true
        },
        {
          action: () =>
          guardianRegistryContract.stakeAndActivate(account, amount, { gasLimit: ANT_ACTIVATE_GAS_LIMIT }),
          description: radspec[actions.STAKE_AND_ACTIVATE_ANT]({ amount: formattedAmount }),
          type: actions.STAKE_AND_ACTIVATE_ANT,
          ensureConfirmation: true
        }
      ]
      return processRequests(requestQueue)
    },
    [antTokenContract, guardianRegistryContract, processRequests]
  )

  const withdrawANT = useCallback(
    (account, amount) => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            guardianRegistryContract.unstake(account, amount, {
              gasLimit: ANT_ACTIONS_GAS_LIMIT,
            }),
          description: radspec[actions.WITHDRAW_ANT]({
            amount: formattedAmount,
          }),
          type: actions.WITHDRAW_ANT,
        },
      ])
    },
    [guardianRegistryContract, processRequests]
  )

  return { activateANT, deactivateANT, unlockActivation, unlockSettings, stakeActivateANT, withdrawANT }
}

/**
 * All dispute interactions
 * @returns {Object} all available functions around a dispute
 */
export function useDisputeActions() {
  const processRequests = useRequestProcessor()
  const disputeManagerContract = useCourtContract(
    CourtModuleType.DisputeManager,
    disputeManagerAbi
  )
  const votingContract = useCourtContract(CourtModuleType.Voting, votingAbi)

  const aragonCourtContract = useCourtContract(
    CourtModuleType.AragonCourt,
    aragonCourtAbi
  )

  const feeTokenContract = useFeeTokenContract()

  // Draft guardians
  const draft = useCallback(
    disputeId => {
      return processRequests([
        {
          action: () =>
            disputeManagerContract.draft(disputeId, {
              gasLimit: GAS_LIMIT,
            }),
          description: radspec[actions.DRAFT_GUARDIAN]({ disputeId }),
          type: actions.DRAFT_GUARDIAN,
        },
      ])
    },
    [disputeManagerContract, processRequests]
  )

  // Request auto reveal
  const autoReveal = useCallback(
    (account, disputeId, roundId, outcome, password) => {
      return {
        action: async () =>
          requestAutoRevealApi(account, disputeId, roundId, outcome, password),
        isTx: false,
        description: 'Enable auto-reveal service',
        onError: 'Failed to enable auto-reveal service',
        onSuccess: 'Auto-reveal service enabled!',
      }
    },
    []
  )

  const requestAutoReveal = useCallback(
    (...params) => processRequests([autoReveal(...params)]),
    [autoReveal, processRequests]
  )

  // Commit
  const commit = useCallback(
    (account, disputeId, roundId, outcome, password, revealServiceEnabled, outcomeOptions) => {
      const voteId = getVoteId(disputeId, roundId)
      const commitment = hashVote(outcome, password)

      const requestQueue = [
        {
          action: () => votingContract.commit(voteId, account, commitment),
          description: radspec[actions.COMMIT_VOTE]({
            disputeId,
            roundId,
            outcome,
            outcomeOptions
          }),
          type: actions.COMMIT_VOTE,
          ensureConfirmation: true,
          // Callback function to run after main tx
          callback: () => saveCodeInLocalStorage(account, disputeId, password),
        },
      ]

      // If guardian opted-in for the reveal service we'll send the commitment and password to the court-server
      if (revealServiceEnabled) {
        requestQueue.push(
          autoReveal(account, disputeId, roundId, outcome, password)
        )
      }

      return processRequests(requestQueue)
    },
    [autoReveal, processRequests, votingContract]
  )

  // Reveal
  const reveal = useCallback(
    (disputeId, roundId, voter, outcome, password) => {
      const voteId = getVoteId(disputeId, roundId)

      return processRequests([
        {
          action: () =>
            votingContract.reveal(
              voteId,
              voter,
              outcome,
              hashPassword(password)
            ),
          description: radspec[actions.REVEAL_VOTE]({
            disputeId,
            roundId,
          }),
          type: actions.REVEAL_VOTE,
        },
      ])
    },
    [processRequests, votingContract]
  )

  // Leak
  const leak = useCallback(
    (voteId, voter, outcome, salt) => {
      return processRequests([
        {
          action: () => votingContract.leak(voteId, voter, outcome, salt),
          description: radspec[actions.LEAK_VOTE]({ voteId, voter }),
          type: actions.LEAK_VOTE,
        },
      ])
    },
    [processRequests, votingContract]
  )

  const approveFeeDeposit = useCallback(
    value => {
      return {
        action: () =>
          feeTokenContract.approve(disputeManagerContract.address, value),
        description: radspec[actions.APPROVE_FEE_DEPOSIT]({
          amount: formatUnits(value),
        }),
        type: actions.APPROVE_FEE_DEPOSIT,
      }
    },
    [disputeManagerContract, feeTokenContract]
  )

  // Appeal round of dispute
  const appeal = useCallback(
    (disputeId, roundId, ruling, outcomeOptions) => {
      return {
        action: () =>
          disputeManagerContract.createAppeal(disputeId, roundId, ruling, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.APPEAL_RULING]({
          disputeId,
          roundId,
          ruling,
          outcomeOptions
        }),
        type: actions.APPEAL_RULING,
      }
    },
    [disputeManagerContract]
  )

  // Confirm appeal round of dispute
  const confirmAppeal = useCallback(
    (disputeId, roundId, ruling, outcomeOptions) => {
      return {
        action: () =>
          disputeManagerContract.confirmAppeal(disputeId, roundId, ruling, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.CONFIRM_APPEAL]({
          disputeId,
          roundId,
          ruling,
          outcomeOptions
        }),
        type: actions.CONFIRM_APPEAL,
      }
    },
    [disputeManagerContract]
  )

  // General function that will appeal or confirm appeal a given round on a given dispute
  const appealRound = useCallback(
    (disputeId, roundId, ruling, requiredDeposit, allowance, confirm, voteButtons) => {
      const requestQueue = []

      // Check if requires pre-transactions
      if (allowance.lt(requiredDeposit)) {
        // Some ERC20s don't allow setting a new allowance if the current allowance is positive
        if (!allowance.eq(0)) {
          // Reset allowance
          requestQueue.push({
            ...approveFeeDeposit(bigNum(0)),
            ensureConfirmation: true,
          })
        }

        // Approve fee deposit for appealing
        requestQueue.push({
          ...approveFeeDeposit(requiredDeposit),
          ensureConfirmation: true,
        })
      }

      const request = confirm ? confirmAppeal : appeal

      requestQueue.push(request(disputeId, roundId, ruling, voteButtons))

      return processRequests(requestQueue)
    },
    [appeal, approveFeeDeposit, confirmAppeal, processRequests]
  )

  const executeRuling = useCallback(
    disputeId => {
      return processRequests([
        {
          action: () =>
            aragonCourtContract.rule(disputeId, {
              gasLimit: GAS_LIMIT,
            }),
          description: radspec[actions.EXECUTE_RULING]({ disputeId }),
          type: actions.EXECUTE_RULING,
        },
      ])
    },
    [aragonCourtContract, processRequests]
  )

  const settlePenalties = useCallback(
    (disputeId, roundId) => {
      return processRequests([
        {
          action: () =>
            disputeManagerContract.settlePenalties(disputeId, roundId, 0, {
                gasLimit: GAS_LIMIT,
            }),
            ensureConfirmation: true,
          description: radspec[actions.SETTLE_PENALTIES]({ disputeId, roundId }),
          type: actions.SETTLE_PENALTIES,
        },
      ])
    }, [disputeManagerContract, processRequests]
  )

  return {
    appealRound,
    requestAutoReveal,
    commit,
    draft,
    executeRuling,
    leak,
    reveal,
    settlePenalties
  }
}

export function useHeartbeat() {
  const { addActivity } = useActivity()
  const { addRequests } = useRequestQueue()
  const aragonCourtContract = useCourtContract(
    CourtModuleType.AragonCourt,
    aragonCourtAbi
  )

  const heartbeatRequest = useCallback(
    (transitions, ensureConfirmation = false) => {
      const description = radspec[actions.HEARTBEAT]({ transitions })

      return {
        intent: () =>
          addActivity(
            aragonCourtContract.heartbeat(transitions),
            actions.HEARTBEAT,
            description
          ),
        description,
        isTx: true,
        ensureConfirmation,
      }
    },
    [addActivity, aragonCourtContract]
  )

  const heartbeat = useCallback(
    transitions => {
      return addRequests(heartbeatRequest(transitions))
    },
    [addRequests, heartbeatRequest]
  )

  return { heartbeat, heartbeatRequest }
}

export function useRewardActions() {
  const processRequests = useRequestProcessor()
  // const { claimFees } = useCourtSubscriptionActions()
  const disputeManagerContract = useCourtContract(
    CourtModuleType.DisputeManager,
    disputeManagerAbi
  )

  const treasuryContract = useCourtContract(
    CourtModuleType.Treasury,
    courtTreasuryAbi
  )

  const settleReward = useCallback(
    (disputeId, roundId, guardian) => {
      return {
        action: () =>
          disputeManagerContract.settleReward(disputeId, roundId, guardian, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.SETTLE_REWARD]({ roundId, disputeId }),
        type: actions.SETTLE_REWARD,
      }
    },
    [disputeManagerContract]
  )

  const settleAppealDeposit = useCallback(
    (disputeId, roundId) => {
      return {
        action: () =>
          disputeManagerContract.settleAppealDeposit(disputeId, roundId, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.SETTLE_APPEAL_DEPOSIT]({
          roundId,
          disputeId,
        }),
        type: actions.SETTLE_APPEAL_DEPOSIT,
      }
    },
    [disputeManagerContract]
  )

  const withdraw = useCallback(
    (token, from, to, amount) => {
      return {
        action: () =>
          treasuryContract.withdraw(token, from, to, amount, {
            gasLimit: ANT_ACTIONS_GAS_LIMIT,
          }),
        description: radspec[actions.CLAIM_REWARDS]({
          amount: formatUnits(amount),
        }),
        type: actions.CLAIM_REWARDS,
      }
    },
    [treasuryContract]
  )

  const claimRewards = useCallback(
    (
      account,
      arbitrableFees,
      appealFees,
      treasuryFees,
      subscriptionFees,
      feeTokenAddress
    ) => {

      const requestQueue = []

      // Claim all arbitrable fee rewards
      for (const arbitrableFee of arbitrableFees) {
        const { disputeId, rounds } = arbitrableFee
        for (const roundId of rounds) {
          requestQueue.push(settleReward(disputeId, roundId, account))
        }
      }

      // Claim all appeal fee rewards
      for (const appealFee of appealFees) {
        const { disputeId, rounds } = appealFee
        for (const roundId of rounds) {
          requestQueue.push(settleAppealDeposit(disputeId, roundId))
        }
      }

      // If we have settlements to do, then we'll make sure that the last
      // settlement is confirmed before withdrawing total fees from the treasury
      if (requestQueue.length > 0) {
        const lastSettlement = requestQueue.pop()
        requestQueue.push({
          ...lastSettlement,
          ensureConfirmation: true,
        })
      }

      // Withdraw funds from treasury
      if (treasuryFees.gt(0)) {
        requestQueue.push(withdraw(feeTokenAddress, account, account, treasuryFees))
      }

      // Claim subscription fees
      /*
        The below claimFees need to be changed to reflect PaymentsBook since subscriptions
        was changed to PaymentsBook.
      */
      // for (const subscriptionFee of subscriptionFees) {
      //   requestQueue.push(claimFees(subscriptionFee.periodId))
      // }

      return processRequests(requestQueue)
    },
    [processRequests, settleAppealDeposit, settleReward, withdraw]
  )

  return { claimRewards }
}

/*
TODO: below code needs to be changed to reflect newest changes on PaymentsBook, because
subscription was changed to PaymentsBook. Abi changes too.
*/
export function useCourtSubscriptionActions() {
  const courtSubscriptionsContract = useCourtContract(
    CourtModuleType.Subscriptions,
    courtSubscriptionsAbi
  )

  const claimFees = useCallback(
    periodId => {
      return {
        action: () => courtSubscriptionsContract.claimFees(periodId),
        description: radspec[actions.CLAIM_SUBSCRIPTION_FEES]({
          periodId,
        }),
        type: actions.CLAIM_SUBSCRIPTION_FEES,
      }
    },
    [courtSubscriptionsContract]
  )

  const getGuardianShare = useCallback(
    (guardian, periodId) => {
      return courtSubscriptionsContract.getGuardianShare(guardian, periodId)
    },
    [courtSubscriptionsContract]
  )

  const getters = useMemo(
    () => (courtSubscriptionsContract ? { getGuardianShare } : null),
    [courtSubscriptionsContract, getGuardianShare]
  )

  return {
    claimFees,
    getters,
  }
}

/**
 *
 * @param {string} disputeId id of the dispute
 * @param {string} roundId id of the round
 * @returns {Object} appeal deposit and confirm appeal deposit amounts
 */
export function useAppealDeposits(disputeId, roundId) {
  const [appealDeposits, setAppealDeposits] = useState({
    amounts: [bigNum(0), bigNum(0)],
    error: false,
  })

  const disputeManagerContract = useCourtContract(
    CourtModuleType.DisputeManager,
    disputeManagerAbi
  )

  useEffect(() => {
    let cancelled = false

    const fetchNextRoundDetails = async () => {
      if (!disputeManagerContract) {
        return
      }

      retryMax(() =>
        disputeManagerContract
          .getNextRoundDetails(disputeId, roundId)
          .then(nextRound => {
            const appealDeposit = nextRound[6]
            const confirmAppealDeposit = nextRound[7]

            if (!cancelled) {
              setAppealDeposits({
                amounts: [appealDeposit, confirmAppealDeposit],
                error: false,
              })
            }
          })
          .catch(err => {
            captureException(err)
            if (!cancelled) {
              setAppealDeposits(appealDeposits => ({
                ...appealDeposits,
                error: true,
              }))
            }
          })
      )
    }

    fetchNextRoundDetails()

    return () => {
      cancelled = true
    }
  }, [disputeId, disputeManagerContract, roundId])

  return [appealDeposits.amounts, appealDeposits.error]
}

export function useFeeBalanceOf(account) {
  const [feeBalance, setFeeBalance] = useState({
    amount: bigNum(0),
    error: false,
  })

  const feeTokenContract = useFeeTokenContract()

  useEffect(() => {
    let cancelled = false

    const getFeeBalance = async () => {
      if (!feeTokenContract) return

      retryMax(() => feeTokenContract.balanceOf(account))
        .then(balance => {
          if (!cancelled) {
            setFeeBalance({ amount: balance, error: false })
          }
        })
        .catch(err => {
          captureException(err)
          if (!cancelled) {
            setFeeBalance(feeBalance => ({
              ...feeBalance,
              error: true,
            }))
          }
        })
    }

    getFeeBalance()

    return () => {
      cancelled = true
    }
  }, [account, feeTokenContract])

  return [feeBalance.amount, feeBalance.error]
}

export function useAppealFeeAllowance(owner) {
  const [allowance, setAllowance] = useState({
    amount: bigNum(0),
    error: false,
  })

  const courtConfig = useCourtConfig()
  const disputeManagerAddress = getModuleAddress(
    courtConfig.modules,
    CourtModuleType.DisputeManager
  )
  const feeTokenContract = useFeeTokenContract()

  useEffect(() => {
    let cancelled = false

    const getFeeAllowance = async () => {
      if (!feeTokenContract) return

      retryMax(() => feeTokenContract.allowance(owner, disputeManagerAddress))
        .then(allowance => {
          if (!cancelled) {
            setAllowance({ amount: allowance, error: false })
          }
        })
        .catch(err => {
          captureException(err)
          if (!cancelled) {
            setAllowance(allowance => ({
              ...allowance,
              error: true,
            }))
          }
        })
    }

    getFeeAllowance()

    return () => {
      cancelled = true
    }
  }, [disputeManagerAddress, feeTokenContract, owner])

  return [allowance.amount, allowance.error]
}

export function useActiveBalanceOfAt(guardian, termId) {
  const guardianRegistryContract = useCourtContract(
    CourtModuleType.GuardiansRegistry,
    guardianRegistryAbi
  )
  const [activeBalance, setActiveBalance] = useState({
    amount: bigNum(-1),
    error: false,
  })

  useEffect(() => {
    let cancelled = false

    const getActiveBalanceOfAt = async () => {
      if (!guardianRegistryContract) return

      retryMax(() => guardianRegistryContract.activeBalanceOfAt(guardian, termId))
        .then(balance => {
          if (!cancelled) {
            setActiveBalance({ amount: balance, error: false })
          }
        })
        .catch(err => {
          captureException(err)
          if (!cancelled) {
            setActiveBalance(balance => ({
              ...balance,
              error: true,
            }))
          }
        })
    }

    getActiveBalanceOfAt()

    return () => {
      cancelled = true
    }
  }, [guardian, guardianRegistryContract, termId])

  return [activeBalance.amount, activeBalance.error]
}

// TODO remove this commented function in case we are not going to track the staked

// export function useTotalANTStakedPolling(timeout = 1000) {
//   const [totalANTStaked, setTotalANTStaked] = useState(bigNum(-1))
//   const [error, setError] = useState(false)
//   const { address: antAddress } = getKnownToken('ANT') || {}
//   const antContract = useContractReadOnly(antAddress, tokenAbi)

//   // We are starting in 0 in order to immediately make the fetch call
//   const controlledTimeout = useRef(0)

//   useEffect(() => {
//     let cancelled = false
//     let timeoutId

//     // This stat is only relevant and shown on mainnet
//     if (!networkReserveAddress) {
//       return setError(true)
//     }

//     if (!antContract) {
//       return
//     }

//     const fetchTotalANTBalance = () => {
//       timeoutId = setTimeout(() => {
//         const vaultBalancePromise = antContract.balanceOf(networkReserveAddress)

//         return vaultBalancePromise
//           .then(antInVault => {
//             if (!cancelled) {
//               setTotalANTStaked(antInVault)
//             }
//           })
//           .catch(err => {
//             console.error(`Error fetching balance: ${err} retrying...`)
//             setError(true)
//           })
//           .finally(() => {
//             if (!cancelled) {
//               clearTimeout(timeoutId)
//               controlledTimeout.current = timeout
//               fetchTotalANTBalance()
//             }
//           })
//       }, controlledTimeout.current)
//     }

//     fetchTotalANTBalance()

//     return () => {
//       cancelled = true
//       clearTimeout(timeoutId)
//     }
//   }, [antContract, controlledTimeout, timeout])

//   return [totalANTStaked, error]
// }
