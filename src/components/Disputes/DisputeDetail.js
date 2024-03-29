import React, { useCallback, useMemo, useEffect, createContext, useState } from 'react'
import { BackButton, Bar, Box, GU, SidePanel, Split } from '@aragon/ui'
import { useHistory } from 'react-router-dom'

import AppealPanel from './panels/AppealPanel'
import Banner from './PrecedenceCampaign/PrecedenceCampaignBanner'
import CommitPanel from './panels/CommitPanel'
import DisputeEvidences from './DisputeEvidences'
import DisputeInfo from './DisputeInfo'
import DisputeTimeline from './DisputeTimeline'
import MessageCard from '../MessageCard'
import NoEvidence from './NoEvidence'
import RevealPanel from './panels/RevealPanel'
import TitleHeader from '../TitleHeader'

import { Status as DisputeStatus } from '../../types/dispute-status-types'
import { useDisputeLogic, REQUEST_MODE } from '../../hooks/dispute-logic'
import { DisputeNotFound } from '../../errors'
import { toMs } from '../../utils/date-utils'

import timelineErrorSvg from '../../assets/noResultsSmall.svg'

export const DisputeContext = createContext()

const DisputeDetail = React.memo(function DisputeDetail({ match }) {
  const history = useHistory()
  const { id: disputeId } = match.params

  const {
    actions,
    error,
    dispute,
    disputeFetching,
    requestMode,
    panelState,
    requests,
  } = useDisputeLogic(disputeId)

  const [voteButtons, setVoteButtons] = useState(null)

  useEffect(() => {
    if(dispute && dispute.metadata && dispute.metadata.buttons) {
      setVoteButtons(dispute.metadata.buttons);
    }
  }, [dispute])

  const evidenceList = dispute?.evidences
  
  const evidences = useMemo(
    () =>
      (evidenceList || []).map(evidence => {
        const data = evidence.data
        return {
          ...evidence, 
          data,
          createdAt: toMs(evidence.createdAt)
        }
      }),
    [evidenceList]
  )

  const handleBack = useCallback(() => {
    history.push('/disputes')
  }, [history])

  const noDispute = !dispute && !disputeFetching

  if (noDispute && !error) {
    throw new DisputeNotFound(disputeId)
  }

  const DisputeInfoComponent = (
    <DisputeInfo
      id={disputeId}
      error={error}
      dispute={dispute}
      loading={disputeFetching}
      onDraft={actions.draft}
      onRequestCommit={requests.commit}
      onRequestReveal={requests.reveal}
      onLeak={actions.leak}
      onRequestAppeal={requests.appeal}
      onAutoReveal={actions.requestAutoReveal}
      onExecuteRuling={actions.executeRuling}
      onSettlePenalties={actions.settlePenalties}
    />
  )

  return (
    <React.Fragment>
      {dispute?.marksPrecedent && <Banner disputeId={disputeId} />}
      <TitleHeader title="Disputes" />
      <Bar>
        <BackButton onClick={handleBack} />
      </Bar>
      <DisputeContext.Provider value={{ voteButtons, setVoteButtons }}>
        {dispute?.status === DisputeStatus.Voided ? (
          DisputeInfoComponent
        ) : (
          <Split
            primary={
              <React.Fragment>
                {DisputeInfoComponent}
                {(() => {
                  if (disputeFetching || error?.fromGraph) {
                    return null
                  }
                  if (evidences.length === 0) {
                    return <NoEvidence />
                  }
                  return (
                    <DisputeEvidences dispute={dispute} evidences={evidences} />
                  )
                })()}
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <Box
                  heading="Dispute timeline"
                  padding={error?.fromGraph ? 3 * GU : 0}
                >
                  {(() => {
                    if (error?.fromGraph) {
                      return (
                        <MessageCard
                          title="We couldn’t load the dispute timeline"
                          paragraph="Something went wrong! Please restart the app"
                          icon={timelineErrorSvg}
                          mode="compact"
                          border={false}
                        />
                      )
                    }
                    if (disputeFetching) {
                      return <div css="height: 200px" />
                    }
                    return <DisputeTimeline dispute={dispute} />
                  })()}
                </Box>
              </React.Fragment>
            }
          />
        )}
        <SidePanel
          title={<PanelTitle requestMode={requestMode} disputeId={disputeId} />}
          opened={panelState.visible}
          onClose={panelState.requestClose}
          onTransitionEnd={panelState.endTransition}
        >
          <div
            css={`
              margin-top: ${2 * GU}px;
            `}
          >
            <PanelComponent
              dispute={dispute}
              requestMode={requestMode}
              commit={actions.commit}
              reveal={actions.reveal}
              appealRound={actions.appealRound}
              approveFeeDeposit={actions.approveFeeDeposit}
              onDone={panelState.requestClose}
            />
          </div>
        </SidePanel>
      </DisputeContext.Provider>
    </React.Fragment>
  )
})

const PanelTitle = ({ requestMode, disputeId }) => {
  const { mode, data } = requestMode

  if (mode === REQUEST_MODE.COMMIT) {
    return `Commit your vote on dispute #${disputeId}`
  }

  if (mode === REQUEST_MODE.REVEAL) {
    return `Reveal your vote on dispute #${disputeId}`
  }

  if (mode === REQUEST_MODE.APPEAL) {
    return data.confirm
      ? `Confirm an appeal on dispute #${disputeId}`
      : `Appeal decision on dispute #${disputeId}`
  }

  return null
}

const PanelComponent = ({
  appealRound,
  approveFeeDeposit,
  commit,
  dispute,
  requestMode,
  reveal,
  ...props
}) => {
  const { mode, data } = requestMode

  if (mode === REQUEST_MODE.COMMIT) {
    return (
      <CommitPanel
        dispute={dispute}
        outcome={data.outcome}
        onCommit={commit}
        {...props}
      />
    )
  }

  if (mode === REQUEST_MODE.REVEAL) {
    return <RevealPanel dispute={dispute} onReveal={reveal} {...props} />
  }

  if (mode === REQUEST_MODE.APPEAL) {
    return (
      <AppealPanel
        dispute={dispute}
        onApproveFeeDeposit={approveFeeDeposit}
        onAppeal={appealRound}
        confirm={data.confirm}
        {...props}
      />
    )
  }

  return null
}

export default DisputeDetail
