import { useCallback, useEffect, useMemo, useState } from 'react'
import { captureException } from '@sentry/browser'

// hooks
import { useCourtConfig } from '../providers/CourtConfig'
import { useActivity } from '../providers/ActivityProvider'
import { useRequestQueue } from '../providers/RequestQueue'
import { useRequestProcessor } from './useRequestProcessor'
import { useContract } from '../web3-contracts'

// utils
import radspec from '../radspec'
import { retryMax } from '../utils/retry-max'
import actions from '../actions/court-action-types'
import { getModuleAddress } from '../utils/court-utils'
import { bigNum, formatUnits } from '../lib/math-utils'
import {
  encodeFunctionData,
  getFunctionSignature,
  sanitizeSignature,
} from '../lib/web3-utils'
import { CourtModuleType } from '../types/court-module-types'
import {
  getVoteId,
  hashPassword,
  hashVote,
  saveCodeInLocalStorage,
} from '../utils/crvoting-utils'

// abis
import agreementAbi from '../abi/Agreement.json'
import aragonCourtAbi from '../abi/AragonCourt.json'
import brightIdRegisterAbi from '../abi/BrightIdRegister.json'
import courtSubscriptionsAbi from '../abi/CourtSubscriptions.json'
import courtTreasuryAbi from '../abi/CourtTreasury.json'
import disputeManagerAbi from '../abi/DisputeManager.json'
import jurorRegistryAbi from '../abi/JurorRegistry.json'
import tokenAbi from '../abi/ERC20.json'
import votingAbi from '../abi/CRVoting.json'

const GAS_LIMIT = 1200000
const HNY_ACTIVATE_GAS_LIMIT = 1000000
const HNY_ACTIONS_GAS_LIMIT = 400000
const ACTIVATE_SELECTOR = getFunctionSignature('activate(uint256)')

export function useAgreementContract(subject) {
  return useContract(subject, agreementAbi)
}

// HNY contract
function useHNYTokenContract() {
  const { anjToken } = useCourtConfig()

  const anjTokenAddress = anjToken ? anjToken.id : null

  return useContract(anjTokenAddress, tokenAbi)
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
 * All HNY interactions
 * @returns {Object} all available functions around HNY balances
 */
export function useHNYActions() {
  const processRequests = useRequestProcessor()
  const jurorRegistryContract = useCourtContract(
    CourtModuleType.JurorsRegistry,
    jurorRegistryAbi
  )

  const brightIdRegisterContract = useCourtContract(
    CourtModuleType.BrightIdRegister,
    brightIdRegisterAbi
  )

  const hnyTokenContract = useHNYTokenContract()

  const brightIdRegisterAndCall = useCallback(
    async (jurorAddress, brightIdData, calldata) => {
      const signature = sanitizeSignature(brightIdData.signature)
      return brightIdRegisterContract.register(
        brightIdData.userAddresses,
        [brightIdData.timestamp],
        [signature.v],
        [signature.r],
        [signature.s],
        jurorRegistryContract.address,
        calldata
      )
    },
    [brightIdRegisterContract, jurorRegistryContract]
  )

  const approve = useCallback(
    value => {
      return {
        action: () =>
          hnyTokenContract.approve(jurorRegistryContract.address, value),
        description: radspec[actions.APPROVE_ACTIVATION_AMOUNT]({
          amount: formatUnits(value),
        }),
        type: actions.APPROVE_ACTIVATION_AMOUNT,
      }
    },
    [hnyTokenContract, jurorRegistryContract]
  )

  // activate HNY directly from available balance
  const activateHNY = useCallback(
    (jurorAddress, amount, brightIdData) => {
      const formattedAmount = formatUnits(amount)

      const activationData = encodeFunctionData(
        jurorRegistryContract,
        'activate',
        [amount.toHexString()]
      )

      return processRequests([
        {
          action: () =>
            brightIdData.hasUniqueUserId
              ? jurorRegistryContract.activate(amount, {
                  gasLimit: HNY_ACTIVATE_GAS_LIMIT,
                })
              : brightIdRegisterAndCall(
                  jurorAddress,
                  brightIdData,
                  activationData,
                  {
                    gasLimit: HNY_ACTIVATE_GAS_LIMIT,
                  }
                ),
          description: radspec[actions.ACTIVATE_HNY]({
            amount: formattedAmount,
          }),
          type: actions.ACTIVATE_HNY,
        },
      ])
    },
    [brightIdRegisterAndCall, jurorRegistryContract, processRequests]
  )

  const deactivateHNY = useCallback(
    amount => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            jurorRegistryContract.deactivate(amount, {
              gasLimit: HNY_ACTIONS_GAS_LIMIT,
            }),
          description: radspec[actions.DEACTIVATE_HNY]({
            amount: formattedAmount,
          }),
          type: actions.DEACTIVATE_HNY,
        },
      ])
    },
    [jurorRegistryContract, processRequests]
  )

  // approve, stake and activate HNY
  const stakeActivateHNY = useCallback(
    (jurorAddress, amount, brightIdData, allowance) => {
      const formattedAmount = formatUnits(amount)

      const requestQueue = []
      if (brightIdData.hasUniqueUserId) {
        requestQueue.push({
          action: () =>
            hnyTokenContract.approveAndCall(
              jurorRegistryContract.address,
              amount,
              ACTIVATE_SELECTOR,
              { gasLimit: HNY_ACTIVATE_GAS_LIMIT }
            ),
          description: radspec[actions.ACTIVATE_HNY]({
            amount: formattedAmount,
          }),
          type: actions.ACTIVATE_HNY,
        })
      } else {
        // Check if requires pre-transactions
        if (allowance.lt(amount)) {
          // Some ERC20s don't allow setting a new allowance if the current allowance is positive
          if (!allowance.eq(0)) {
            // Reset allowance
            requestQueue.push({
              ...approve(bigNum(0)),
              ensureConfirmation: true,
            })
          }

          // Approve activation amount
          requestQueue.push({
            ...approve(amount),
            ensureConfirmation: true,
          })
        }

        const calldata = encodeFunctionData(jurorRegistryContract, 'stake', [
          amount,
          ACTIVATE_SELECTOR,
        ])

        requestQueue.push({
          action: () =>
            brightIdRegisterAndCall(jurorAddress, brightIdData, calldata, {
              gasLimit: HNY_ACTIVATE_GAS_LIMIT,
            }),
          description: radspec[actions.ACTIVATE_HNY]({
            amount: formattedAmount,
          }),
          type: actions.ACTIVATE_HNY,
        })
      }

      return processRequests(requestQueue)
    },
    [
      approve,
      brightIdRegisterAndCall,
      hnyTokenContract,
      jurorRegistryContract,
      processRequests,
    ]
  )

  const withdrawHNY = useCallback(
    amount => {
      const formattedAmount = formatUnits(amount)

      return processRequests([
        {
          action: () =>
            jurorRegistryContract.unstake(amount, '0x', {
              gasLimit: HNY_ACTIONS_GAS_LIMIT,
            }),
          description: radspec[actions.WITHDRAW_HNY]({
            amount: formattedAmount,
          }),
          type: actions.WITHDRAW_HNY,
        },
      ])
    },
    [jurorRegistryContract, processRequests]
  )

  return { activateHNY, deactivateHNY, stakeActivateHNY, withdrawHNY }
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
  const feeTokenContract = useFeeTokenContract()

  // Draft jurors
  const draft = useCallback(
    disputeId => {
      return processRequests([
        {
          action: () =>
            disputeManagerContract.draft(disputeId, {
              gasLimit: GAS_LIMIT,
            }),
          description: radspec[actions.DRAFT_JURY]({ disputeId }),
          type: actions.DRAFT_JURY,
        },
      ])
    },
    [disputeManagerContract, processRequests]
  )

  // Commit
  const commit = useCallback(
    (account, disputeId, roundId, outcome, password) => {
      const voteId = getVoteId(disputeId, roundId)
      const commitment = hashVote(outcome, password)

      const requestQueue = [
        {
          action: () => votingContract.commit(voteId, commitment),
          description: radspec[actions.COMMIT_VOTE]({
            disputeId,
            roundId,
            outcome,
          }),
          type: actions.COMMIT_VOTE,
          ensureConfirmation: true,
          // Callback function to run after main tx
          callback: () => saveCodeInLocalStorage(account, disputeId, password),
        },
      ]

      return processRequests(requestQueue)
    },
    [processRequests, votingContract]
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
    (disputeId, roundId, ruling) => {
      return {
        action: () =>
          disputeManagerContract.createAppeal(disputeId, roundId, ruling, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.APPEAL_RULING]({
          disputeId,
          roundId,
          ruling,
        }),
        type: actions.APPEAL_RULING,
      }
    },
    [disputeManagerContract]
  )

  // Confirm appeal round of dispute
  const confirmAppeal = useCallback(
    (disputeId, roundId, ruling) => {
      return {
        action: () =>
          disputeManagerContract.confirmAppeal(disputeId, roundId, ruling, {
            gasLimit: GAS_LIMIT,
          }),
        description: radspec[actions.CONFIRM_APPEAL]({
          disputeId,
          roundId,
          ruling,
        }),
        type: actions.CONFIRM_APPEAL,
      }
    },
    [disputeManagerContract]
  )

  // General function that will appeal or confirm appeal a given round on a given dispute
  const appealRound = useCallback(
    (disputeId, roundId, ruling, requiredDeposit, allowance, confirm) => {
      const requestQueue = []

      // Check if requires pre-transactions
      if (allowance.lt(requiredDeposit)) {
        // Some ERC20s don't allow setting a new allowance if the current allowance is positive
        if (!allowance.eq(0)) {
          // Reset allowance
          requestQueue.push({
            ...approveFeeDeposit(0),
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

      requestQueue.push(request(disputeId, roundId, ruling))

      return processRequests(requestQueue)
    },
    [appeal, approveFeeDeposit, confirmAppeal, processRequests]
  )

  const resolveRuling = useCallback(
    (arbitrableContract, disputeId) => {
      return processRequests([
        {
          action: () =>
            arbitrableContract.resolve(disputeId, {
              gasLimit: GAS_LIMIT,
            }),
          description: radspec[actions.EXECUTE_RULING]({ disputeId }),
          type: actions.EXECUTE_RULING,
        },
      ])
    },
    [processRequests]
  )

  return {
    appealRound,
    commit,
    draft,
    resolveRuling,
    leak,
    reveal,
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
  const { claimFees } = useCourtSubscriptionActions()
  const disputeManagerContract = useCourtContract(
    CourtModuleType.DisputeManager,
    disputeManagerAbi
  )

  const treasuryContract = useCourtContract(
    CourtModuleType.Treasury,
    courtTreasuryAbi
  )

  const settleReward = useCallback(
    (disputeId, roundId, juror) => {
      return {
        action: () =>
          disputeManagerContract.settleReward(disputeId, roundId, juror, {
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
    (token, to, amount) => {
      return {
        action: () =>
          treasuryContract.withdraw(token, to, amount, {
            gasLimit: HNY_ACTIONS_GAS_LIMIT,
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
        requestQueue.push(withdraw(feeTokenAddress, account, treasuryFees))
      }

      // Claim subscription fees
      for (const subscriptionFee of subscriptionFees) {
        requestQueue.push(claimFees(subscriptionFee.periodId))
      }

      return processRequests(requestQueue)
    },
    [claimFees, processRequests, settleAppealDeposit, settleReward, withdraw]
  )

  return { claimRewards }
}

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

  const getJurorShare = useCallback(
    (juror, periodId) => {
      return courtSubscriptionsContract.getJurorShare(juror, periodId)
    },
    [courtSubscriptionsContract]
  )

  const getters = useMemo(
    () => (courtSubscriptionsContract ? { getJurorShare } : null),
    [courtSubscriptionsContract, getJurorShare]
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
  const courtConfig = useCourtConfig()
  const disputeManagerAddress = getModuleAddress(
    courtConfig.modules,
    CourtModuleType.DisputeManager
  )
  const feeTokenContract = useFeeTokenContract()

  const allowance = useTokenAllowance(
    feeTokenContract,
    owner,
    disputeManagerAddress
  )

  return [allowance.amount, allowance.error]
}

export function useHNYTokenAllowance(owner) {
  const courtConfig = useCourtConfig()
  const jurorRegistryAddress = getModuleAddress(
    courtConfig.modules,
    CourtModuleType.JurorsRegistry
  )
  const hnyTokenContract = useHNYTokenContract()

  const allowance = useTokenAllowance(
    hnyTokenContract,
    owner,
    jurorRegistryAddress
  )

  return [allowance.amount, allowance.error]
}

function useTokenAllowance(contract, owner, spender) {
  const [allowance, setAllowance] = useState({
    amount: bigNum(0),
    error: false,
  })

  useEffect(() => {
    let cancelled = false

    const fetchAllowance = async () => {
      if (!contract) return

      retryMax(() => contract.allowance(owner, spender))
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

    fetchAllowance()

    return () => {
      cancelled = true
    }
  }, [contract, owner, spender])

  return allowance
}

export function useActiveBalanceOfAt(juror, termId) {
  const jurorRegistryContract = useCourtContract(
    CourtModuleType.JurorsRegistry,
    jurorRegistryAbi
  )
  const [activeBalance, setActiveBalance] = useState({
    amount: bigNum(-1),
    error: false,
  })

  useEffect(() => {
    let cancelled = false

    const getActiveBalanceOfAt = async () => {
      if (!jurorRegistryContract) return

      retryMax(() => jurorRegistryContract.activeBalanceOfAt(juror, termId))
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
  }, [juror, jurorRegistryContract, termId])

  return [activeBalance.amount, activeBalance.error]
}

export function useHNYBalanceOfPolling(juror) {
  const hnyTokenContract = useHNYTokenContract()
  const [balance, setBalance] = useState(bigNum(-1))

  const timer = 3000

  useEffect(() => {
    let cancelled = false

    if (!hnyTokenContract) return

    // Assumes jurorDraft exists
    const pollActiveBalanceOf = async () => {
      try {
        const balance = await hnyTokenContract.balanceOf(juror)

        if (!cancelled) {
          setBalance(balance)
        }
      } catch (err) {
        console.error(`Error fetching balance: ${err} retrying…`)
      }

      if (!cancelled) {
        setTimeout(pollActiveBalanceOf, timer)
      }
    }

    pollActiveBalanceOf()

    return () => {
      cancelled = true
    }
  }, [hnyTokenContract, juror, timer])

  return balance
}

export function useMaxActiveBalance(termId) {
  const [maxActiveBalance, setMaxActiveBalance] = useState(bigNum(0))
  const jurorRegistryContract = useCourtContract(
    CourtModuleType.JurorsRegistry,
    jurorRegistryAbi
  )

  useEffect(() => {
    if (!jurorRegistryContract) {
      return
    }

    let cancelled = false

    const fetchMaxActiveBalance = async () => {
      try {
        const maxActiveBalance = await jurorRegistryContract.maxActiveBalance(
          termId
        )

        if (!cancelled) {
          setMaxActiveBalance(maxActiveBalance)
        }
      } catch (err) {
        console.error(`Error ${err}`)
      }
    }

    fetchMaxActiveBalance()

    return () => {
      cancelled = true
    }
  }, [jurorRegistryContract, termId])

  return maxActiveBalance
}
export function useJurorUniqueUserId(juror) {
  const [uniqueUserId, setUniqueUserID] = useState(null)
  const brightIdRegisterContract = useCourtContract(
    CourtModuleType.BrightIdRegister,
    brightIdRegisterAbi
  )

  useEffect(() => {
    if (!brightIdRegisterContract) {
      return
    }

    let cancelled = false

    const fetchUniqueUserID = async () => {
      try {
        const uniqueUserId = await brightIdRegisterContract.uniqueUserId(juror)

        if (!cancelled) {
          setUniqueUserID(uniqueUserId)
        }
      } catch (err) {
        console.error(`Error ${err}`)
      }
    }

    fetchUniqueUserID()

    return () => {
      cancelled = true
    }
  }, [brightIdRegisterContract, juror])

  return uniqueUserId
}
