import React, { useMemo } from 'react'
import { GU, Help, textStyle, useTheme } from '@aragon/ui'
import {
  Phase as DisputePhase,
  Status as DisputeStatus,
} from '../../types/dispute-status-types'
import DisputeAppeal from './actions/DisputeAppeal'
import DisputeAutoReveal from './DisputeAutoReveal'
import DisputeDraft from './actions/DisputeDraft'
import DisputeExecuteRuling from './actions/DisputeExecuteRuling'
import DisputeReveal from './actions/DisputeReveal'
import DisputeVoting from './actions/DisputeVoting'
import { useWallet } from '../../providers/Wallet'
import {
  getGuardianDraft,
  hasGuardianVoted,
  canGuardianReveal,
} from '../../utils/guardian-draft-utils'
import {
  isvoteLeaked,
  voteOptionToString,
  OUTCOMES,
} from '../../utils/crvoting-utils'
import { dateFormat } from '../../utils/date-utils'

import IconGavelOrange from '../../assets/IconGavelOrange.svg'
import IconGavelRed from '../../assets/IconGavelRed.svg'
import { getDisputeLastRound } from '../../utils/dispute-utils'
import IconRewardsGreen from '../../assets/IconRewardsGreen.svg'

function DisputeActions({
  dispute,
  onAutoReveal,
  onDraft,
  onExecuteRuling,
  onRequestCommit,
  onRequestReveal,
  onRequestAppeal,
}) {
  const { phase, status } = dispute
  const lastRound = getDisputeLastRound(dispute)

  const wallet = useWallet()

  if (phase === DisputePhase.Evidence) {
    return null
  }

  if (phase === DisputePhase.GuardianDrafting) {
    return <DisputeDraft disputeId={dispute.id} onDraft={onDraft} />
  }

  const guardianDraft = getGuardianDraft(lastRound, wallet.account) // TODO: Should we also show results for past rounds ?
  const isGuardianDrafted = !!guardianDraft

  const guardianHasVoted = isGuardianDrafted && hasGuardianVoted(guardianDraft)

  if (phase === DisputePhase.VotingPeriod && !guardianHasVoted) {
    return (
      <DisputeVoting
        draftTermId={lastRound.draftTermId}
        isFinalRound={dispute.maxAppealReached}
        isGuardianDrafted={isGuardianDrafted}
        onRequestCommit={onRequestCommit}
      />
    )
  }

  return (
    <React.Fragment>
      <InformationSection
        phase={phase}
        status={status}
        guardianDraft={guardianDraft}
        hasGuardianVoted={guardianHasVoted}
        lastRound={lastRound}
      />
      {(() => {
        // If connected account not drafted for current dispute
        if (!isGuardianDrafted) return null

        // If guardian has already voted
        if (phase === DisputePhase.VotingPeriod)
          return (
            <DisputeAutoReveal
              disputeId={dispute.id}
              commitment={guardianDraft.commitment}
              onAutoReveal={onAutoReveal}
              roundId={dispute.lastRoundId}
            />
          )

        // If we are past the voting period && guardian hasn't voted
        if (!guardianHasVoted) return null

        // If reveal period has already pass
        if (phase !== DisputePhase.RevealVote) return null

        // If guardian cannot reveal (has already revealed || voted leaked)
        if (!canGuardianReveal(guardianDraft)) return null

        return (
          <DisputeReveal
            disputeId={dispute.id}
            roundId={dispute.lastRoundId}
            commitment={guardianDraft.commitment}
            onRequestReveal={onRequestReveal}
          />
        )
      })()}

      {(phase === DisputePhase.AppealRuling ||
        phase === DisputePhase.ConfirmAppeal) && (
        <DisputeAppeal
          disputeId={dispute.id}
          roundId={dispute.lastRoundId}
          onRequestAppeal={onRequestAppeal}
          confirm={phase === DisputePhase.ConfirmAppeal}
        />
      )}
      {phase === DisputePhase.ExecuteRuling && (
        <DisputeExecuteRuling
          disputeId={dispute.id}
          onExecuteRuling={onExecuteRuling}
        />
      )}
    </React.Fragment>
  )
}

function InformationSection({
  hasGuardianVoted,
  guardianDraft,
  lastRound,
  phase,
  status,
}) {
  const theme = useTheme()

  const { title, paragraph, background, icon, hint } = useInfoAttributes({
    hasGuardianVoted,
    guardianDraft,
    lastRound,
    phase,
    status,
  })

  if (!guardianDraft) return null

  return (
    <div
      css={`
        background: ${background};
        padding: ${3 * GU}px;
        display: flex;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          margin: 0 auto;
        `}
      >
        <div
          css={`
            margin-right: ${1 * GU}px;
          `}
        >
          <img
            alt=""
            src={icon}
            height="42"
            css={`
              display: block;
            `}
          />
        </div>
        <div>
          <div
            css={`
              ${textStyle('body1')}
            `}
          >
            {title}
          </div>
          <span
            css={`
              ${textStyle('body2')}
              color: ${theme.contentSecondary};
            `}
          >
            {paragraph} {hint && <Help hint={hint} />}
          </span>
        </div>
      </div>
    </div>
  )
}

// Helper function that returns main attributes for the YourVoteInfo component
// TODO: Contemplate final round cases (when a guardian has voted, the ANT amount is pre-slashed)
const useInfoAttributes = ({
  hasGuardianVoted,
  guardianDraft,
  lastRound,
  phase,
  status,
}) => {
  const theme = useTheme()
  const positiveBackground = theme.positive.alpha(0.1)
  const negativeBackground = theme.accent.alpha(0.2)

  return useMemo(() => {
    if (!guardianDraft) return {}

    // If the dispute is in the execute ruling phase it means that the final ruling can already be ensured.
    // If the dispute is closed it means that the final ruling was already ensured.
    const finalRulingConfirmed =
      status === DisputeStatus.Closed || phase === DisputePhase.ExecuteRuling

    // Note that we can assume that the evidence submission and drafting phases have already passed since we do an early return above
    const votingPeriodEnded =
      phase !== DisputePhase.VotingPeriod && phase !== DisputePhase.RevealVote

    const voteLeaked = isvoteLeaked(guardianDraft.outcome)

    // If vote leaked or guardian hasn't voted
    if (!hasGuardianVoted || voteLeaked) {
      return {
        title: voteLeaked
          ? 'Unfortunately, your vote has been leaked'
          : 'Your vote wasn’t cast on time.',
        paragraph: <ANTDiscountedMessage />,
        background: negativeBackground,
        icon: IconGavelRed,
        hintText: voteLeaked ? 'Vote leaked (complete)' : null, // TODO: Add hint for leaked vote
      }
    }

    // If guardian voted and the voting (commit) period has ended
    if (hasGuardianVoted && votingPeriodEnded) {
      // If the guardian didn't revealed
      if (!guardianDraft.outcome) {
        return {
          title: "Your vote wasn't revealed on time",
          paragraph: <ANTDiscountedMessage />,
          background: negativeBackground,
          icon: IconGavelRed,
        }
      }

      // Guardian has revealed
      // Check if has voted in consensus with the plurality for the last round
      const hasVotedInConsensus =
        lastRound.vote && guardianDraft.outcome === lastRound.vote.winningOutcome

      // We must check if the penalties were already settled so we can tell the guardians
      // wether their ANT locked balance has been discounted or they can claim rewards
      // Note that if the penalties for the round are settled it means that the dispute has already ended
      const settledPenalties = lastRound.settledPenalties

      const title = hasVotedInConsensus
        ? 'You have voted in consensus with the plurality'
        : 'You have not voted in consensus with the plurality'
      const background = hasVotedInConsensus
        ? positiveBackground
        : negativeBackground

      // If penalties settled then the locked ANT has been redistributed
      if (settledPenalties) {
        return {
          title,
          paragraph: hasVotedInConsensus ? (
            <ANTRewardsMessage />
          ) : (
            <ANTSlashedMessage />
          ),
          background,
          icon: hasVotedInConsensus ? IconRewardsGreen : IconGavelRed,
        }
      }

      // Includes the cases where penalties weren't settled or the last round hasn't ended
      return {
        title,
        paragraph: (
          <ANTLockedMessage finalRulingConfirmed={finalRulingConfirmed} />
        ),
        background,
        icon: hasVotedInConsensus ? IconGavelOrange : IconGavelRed,
      }
    }

    // Guardian has voted and reveal period hasn't ended
    return {
      title: `Your vote was cast ${
        guardianDraft.outcome ? 'and revealed' : ''
      } successfully.`,
      paragraph: (
        <VoteInfo
          commitmentDate={guardianDraft.commitmentDate}
          outcome={guardianDraft.outcome}
          revealDate={guardianDraft.revealDate}
        />
      ),
      background: theme.accent.alpha(0.05),
      icon: IconGavelOrange,
    }
  }, [
    hasGuardianVoted,
    guardianDraft,
    lastRound.settledPenalties,
    lastRound.vote,
    negativeBackground,
    phase,
    positiveBackground,
    status,
    theme.accent,
  ])
}

const ANTLockedMessage = ({ finalRulingConfirmed }) => {
  return (
    <ANTMessage
      result={`will remain locked until ${
        finalRulingConfirmed
          ? 'penalties are settled'
          : 'the dispute has been resolved'
      }. `}
    />
  )
}

const ANTDiscountedMessage = () => {
  return <ANTMessage result="will be discounted" />
}

const ANTSlashedMessage = () => {
  return (
    <ANTMessage result="has been slashed and redistributed to other guardians" />
  )
}

const ANTMessage = ({ result }) => {
  const theme = useTheme()

  return (
    <span>
      Your{' '}
      <span
        css={`
          color: ${theme.help};
        `}
      >
        ANT locked balance
      </span>{' '}
      {result}
    </span>
  )
}

const ANTRewardsMessage = () => {
  const theme = useTheme()

  return (
    <span>
      You can now claim your
      <span
        css={`
          color: ${theme.help};
        `}
      >
        {' '}
        rewards
      </span>{' '}
      in the dashboard.
    </span>
  )
}

const VoteInfo = ({ commitmentDate, outcome, revealDate }) => {
  const theme = useTheme()

  const formattedDate = dateFormat(
    new Date(revealDate || commitmentDate),
    'standard'
  )

  const outcomeDescription = useMemo(() => {
    if (outcome === OUTCOMES.Refused) {
      return { text: 'Refused to vote' }
    }

    return { prefix: 'voted ', text: voteOptionToString(outcome) }
  }, [outcome])

  return (
    <span>
      You {outcomeDescription.prefix}
      <span
        css={`
          text-transform: uppercase;
          color: ${theme.content};
        `}
      >
        {outcomeDescription.text}
      </span>{' '}
      on{' '}
      <span
        css={`
          color: ${theme.content};
        `}
      >
        {formattedDate}
      </span>
    </span>
  )
}

export default DisputeActions
