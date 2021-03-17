import React, { useMemo } from 'react'
import { GU, Help, textStyle, useTheme } from '@1hive/1hive-ui'
import {
  Phase as DisputePhase,
  Status as DisputeStatus,
} from '../../types/dispute-status-types'
import DisputeAppeal from './actions/DisputeAppeal'
import DisputeDraft from './actions/DisputeDraft'
import DisputeExecuteRuling from './actions/DisputeExecuteRuling'
import DisputeReveal from './actions/DisputeReveal'
import DisputeVoting from './actions/DisputeVoting'
import { useWallet } from '../../providers/Wallet'
import {
  getJurorDraft,
  hasJurorVoted,
  canJurorReveal,
} from '../../utils/juror-draft-utils'
import {
  isvoteLeaked,
  voteOptionToString,
  OUTCOMES,
} from '../../utils/crvoting-utils'
import { dateFormat } from '../../utils/date-utils'

import IconVotingSuccess from '../../assets/IconVotingSuccess.svg'
import IconVotingFailed from '../../assets/IconVotingFailed.svg'
import { getDisputeLastRound } from '../../utils/dispute-utils'
import IconRewardsGreen from '../../assets/IconRewardsGreen.svg'

function DisputeActions({
  dispute,
  onDraft,
  onExecuteRuling,
  onRequestCommit,
  onRequestReveal,
  onRequestAppeal,
}) {
  const { phase, status, subject } = dispute
  const lastRound = getDisputeLastRound(dispute)

  const wallet = useWallet()

  if (phase === DisputePhase.Evidence) {
    return null
  }

  if (phase === DisputePhase.JuryDrafting) {
    return <DisputeDraft disputeId={dispute.id} onDraft={onDraft} />
  }

  const jurorDraft = getJurorDraft(lastRound, wallet.account) // TODO: Should we also show results for past rounds ?
  const isJurorDrafted = !!jurorDraft

  const jurorHasVoted = isJurorDrafted && hasJurorVoted(jurorDraft)

  if (phase === DisputePhase.VotingPeriod && !jurorHasVoted) {
    return (
      <DisputeVoting
        draftTermId={lastRound.draftTermId}
        isFinalRound={dispute.maxAppealReached}
        isJurorDrafted={isJurorDrafted}
        onRequestCommit={onRequestCommit}
      />
    )
  }

  return (
    <React.Fragment>
      <InformationSection
        phase={phase}
        status={status}
        jurorDraft={jurorDraft}
        hasJurorVoted={jurorHasVoted}
        lastRound={lastRound}
      />
      {(() => {
        // If connected account not drafted for current dispute
        if (!isJurorDrafted) return null

        // If we are past the voting period && juror hasn't voted
        if (!jurorHasVoted) return null

        // If reveal period has already pass
        if (phase !== DisputePhase.RevealVote) return null

        // If juror cannot reveal (has already revealed || voted leaked)
        if (!canJurorReveal(jurorDraft)) return null

        return (
          <DisputeReveal
            disputeId={dispute.id}
            roundId={dispute.lastRoundId}
            commitment={jurorDraft.commitment}
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
          subject={subject.id}
        />
      )}
    </React.Fragment>
  )
}

function InformationSection({
  hasJurorVoted,
  jurorDraft,
  lastRound,
  phase,
  status,
}) {
  const theme = useTheme()

  const { title, paragraph, background, icon, hint } = useInfoAttributes({
    hasJurorVoted,
    jurorDraft,
    lastRound,
    phase,
    status,
  })

  if (!jurorDraft) return null

  return (
    <div
      css={`
        background: ${background};
        padding: ${3 * GU}px;
        display: flex;
        border-radius: 12px;
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
        <div
          css={`
            max-width: 550px;
          `}
        >
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
// TODO: Contemplate final round cases (when a juror has voted, the HNY amount is pre-slashed)
const useInfoAttributes = ({
  hasJurorVoted,
  jurorDraft,
  lastRound,
  phase,
  status,
}) => {
  const theme = useTheme()
  const positiveBackground = theme.positive.alpha(0.1)
  const negativeBackground = theme.accent.alpha(0.2)

  return useMemo(() => {
    if (!jurorDraft) return {}

    // Note that we can assume that the evidence submission and drafting phases have already passed since we do an early return above
    const votingPeriodEnded =
      phase !== DisputePhase.VotingPeriod && phase !== DisputePhase.RevealVote

    const voteLeaked = isvoteLeaked(jurorDraft.outcome)

    // If vote leaked or juror hasn't voted
    if (!hasJurorVoted || voteLeaked) {
      return {
        title: voteLeaked
          ? 'Unfortunately, your vote has been leaked'
          : 'Your vote wasn’t cast on time.',
        paragraph: <HNYSlashMessage />,
        background: negativeBackground,
        icon: IconVotingFailed,
        hintText: voteLeaked ? 'Vote leaked (complete)' : null, // TODO: Add hint for leaked vote
      }
    }

    // If juror voted and the voting (commit) period has ended
    if (hasJurorVoted && votingPeriodEnded) {
      // If the juror didn't revealed
      if (!jurorDraft.outcome) {
        return {
          title: "Your vote wasn't revealed on time",
          paragraph: <HNYSlashMessage />,
          background: negativeBackground,
          icon: IconVotingFailed,
        }
      }

      // If the dispute is in the execute ruling phase it means that the final ruling can already be ensured.
      // If the dispute is closed it means that the final ruling was already ensured.
      const finalRulingConfirmed =
        status === DisputeStatus.Closed || phase === DisputePhase.ExecuteRuling

      // Juror has revealed
      return getAttributesWhenRevealed(
        lastRound,
        jurorDraft,
        finalRulingConfirmed,
        { positive: positiveBackground, negative: negativeBackground }
      )
    }

    // Juror has voted and reveal period hasn't ended
    return {
      title: `Your vote was cast ${
        jurorDraft.outcome ? 'and revealed' : ''
      } successfully.`,
      paragraph: (
        <VoteInfo
          commitmentDate={jurorDraft.commitmentDate}
          outcome={jurorDraft.outcome}
          revealDate={jurorDraft.revealDate}
        />
      ),
      background: '#FFFCF7',
      icon: IconVotingSuccess,
    }
  }, [
    hasJurorVoted,
    jurorDraft,
    lastRound,
    negativeBackground,
    phase,
    positiveBackground,
    status,
  ])
}

const HNYLockedMessage = ({ finalRulingConfirmed }) => {
  return (
    <HNYMessage
      result={`will remain locked until ${
        finalRulingConfirmed
          ? 'penalties are settled'
          : 'the dispute has been resolved'
      }. `}
    />
  )
}

const HNYSlashMessage = ({ extra = '' }) => {
  return <HNYMessage result={`will be slashed ${extra}`} />
}

const HNYSlashedMessage = () => {
  return (
    <HNYMessage result="has been slashed and redistributed to other keepers" />
  )
}

const HNYMessage = ({ result }) => {
  const theme = useTheme()

  return (
    <span>
      Your{' '}
      <span
        css={`
          color: ${theme.help};
        `}
      >
        HNY locked balance
      </span>{' '}
      {result}
    </span>
  )
}

const HNYRewardsMessage = () => {
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
      return { text: 'Abstained from voting' }
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

// Assumes juror revealed vote
function getAttributesWhenRevealed(
  lastRound,
  jurorDraft,
  finalRulingConfirmed,
  backgroundColor
) {
  const { appeal, vote } = lastRound

  // Check if has voted in consensus with the plurality for the last round
  const hasVotedInConsensus = vote && jurorDraft.outcome === vote.winningOutcome
  // We must check if the penalties were already settled so we can tell the jurors
  // wether their HNY locked balance has been discounted or they can claim rewards
  // Note that if the penalties for the round are settled it means that the dispute has already ended
  const settledPenalties = lastRound.settledPenalties

  let background, icon, paragraph, title

  // Juror voted in consensus during voting phase
  if (hasVotedInConsensus) {
    background = backgroundColor[appeal ? 'negative' : 'positive']
    icon = appeal ? IconVotingFailed : IconRewardsGreen
    paragraph = appeal ? (
      settledPenalties ? (
        <HNYSlashedMessage />
      ) : (
        <HNYSlashMessage extra="if no one confirms the appeal starting a new round of voting" />
      )
    ) : settledPenalties ? (
      <HNYRewardsMessage />
    ) : (
      <HNYLockedMessage finalRulingConfirmed={finalRulingConfirmed} />
    )
    title = appeal
      ? 'Although you voted in consensus with the plurality during the voting phase, the dispute was appealed with a different outcome'
      : 'You have voted in consensus with the plurality'
  } else {
    // Juror didn't vote in consenus during voting pahse
    // Check if juror voted in favor of the appealed outcome
    const inConsensusWithAppealer =
      appeal && jurorDraft.outcome === appeal.appealedRuling
    background =
      backgroundColor[inConsensusWithAppealer ? 'positive' : 'negative']
    icon = inConsensusWithAppealer ? IconRewardsGreen : IconVotingFailed
    paragraph = inConsensusWithAppealer ? (
      settledPenalties ? (
        <HNYRewardsMessage />
      ) : (
        <HNYLockedMessage finalRulingConfirmed={finalRulingConfirmed} />
      )
    ) : settledPenalties ? (
      <HNYSlashedMessage />
    ) : (
      <HNYSlashMessage />
    )
    title = inConsensusWithAppealer
      ? "Altough you didn't vote in consensus with the plurality during the voting phase, the dispute was appealed with the outcome you voted for"
      : 'You have not voted in consensus with the plurality'
  }

  return {
    background,
    icon,
    paragraph,
    title,
  }
}

export default DisputeActions
