/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import resolvePathname from 'resolve-pathname'
import { GU, Help, Link, textStyle, useTheme, useViewport, DataView, Info} from '@aragon/ui'
import styled from 'styled-components'
import DisputeDetailDescription from './DisputeDetailDescription'
import DisputeOutcomeText from './DisputeOutcomeText'
import IdentityBadge from '../IdentityBadge'
import Loading from '../Loading'
import { useWallet } from '../../providers/Wallet'
import { describeDisputedAction } from '../../disputables'
import { IPFS_ENDPOINT } from '../../endpoints'
import { getIpfsCidFromUri, transformIPFSHash, fetchIPFS } from '../../lib/ipfs-utils'
import { addressesEqual, transformAddresses } from '../../lib/web3-utils'
import { Phase as DisputePhase } from '../../types/dispute-status-types'
// import { dateFormat } from '../../utils/date-utils'
import { useIpfsFetch } from '../../hooks/ipfs-hooks';
import useActionDataDecoder from '../../hooks/useActionDataDecoder'
import GovernDisputedData from './containers/GovernDispute';
import DefaultDisputeData from './containers/DefaultDispute';
import Field from './DisputeField';
import { DISPUTE_TYPES } from '../../utils/metadata/types';

function DisputeInfoContent({ dispute, isFinalRulingEnsured }) {
  const { below } = useViewport()
  const compactMode = below('medium')
  // TODO:GIORGI what to do about this since organization and defendant and other fields don't exist anymore.
  // This is why most of the things are commented out.
  const {
    agreementText,
    agreementUrl,
    creator,
    defendant,
    description,
    disputedAction,
    disputedActionURL,
    executionPath,
    loading,
    organization,
  } = useDisputeFields(dispute)

  return (
    <>
      <Row>
        <Info mode="warning">
          If any of the below details need to be fetched from ipfs and They have been submitted to ipfs recently, 
          it might take some time to distribute to all nodes and show up here then
        </Info>
        <DisputeContainerData dispute={dispute} />
      </Row>
      {isFinalRulingEnsured && (
        <Row>
          <FinalGuardianOutcome dispute={dispute} />
        </Row>
      )}
      {/* <Row compactMode={compactMode}>
        <DisputedAction
          actionText={disputedAction}
          dispute={dispute}
          executionPath={executionPath}
          isFinalRulingEnsured={isFinalRulingEnsured}
          loading={loading}
          url={disputedActionURL}
        />

        {organization && <Field label="Organization" value={organization} />}
      </Row> */}
      <Row compactMode={compactMode}>
        {/* <Field
          label="Description"
          loading={loading}
          value={description}
          css={`
            word-break: break-word;
            overflow-wrap: anywhere;
          `}
        /> */}
      </Row>
      {/* <Row compactMode={compactMode}>
        {agreementText ? (
          <Field
            label="Link to agreement"
            value={
              <Link
                external
                href={agreementUrl}
                css={`
                  text-decoration: none;
                `}
              >
                {agreementText}
              </Link>
            }
          />
        ) : (
          <div />
        )}
        {defendant && <Field label="Defendant" value={defendant} />}
      </Row> */}
    </>
  )
}


function DisputeContainerData({ dispute }) {
  if(!dispute.metadata) return ('')

  return (
    <>
      {
        dispute.metadata.disputeType == DISPUTE_TYPES.GOVERN &&
          <GovernDisputedData dispute={dispute} />
      }
      {
        dispute.metadata.disputeType == DISPUTE_TYPES.DEFAULT &&
          <DefaultDisputeData dispute={dispute} />
      }
    </>
  )
}

function FinalGuardianOutcome({ dispute }) {
  const { lastRoundId, rounds } = dispute
  const lastRound = rounds?.[lastRoundId]
  const voteWinningOutcome = lastRound?.vote?.winningOutcome
  const appealedRuling = lastRound?.appeal?.appealedRuling

  return (
    
    <Field
      label="Final Guardians Outcome"
      value={
        <DisputeOutcomeText
          outcome={appealedRuling || voteWinningOutcome}
          buttons={dispute.metadata?.buttons}
          phase={
            appealedRuling ? DisputePhase.AppealRuling : DisputePhase.RevealVote
          }
        />
      }
    />
  )
}

function DisputedAction({
  actionText,
  dispute,
  executionPath,
  isFinalRulingEnsured,
  loading,
  url,
}) {
  const ActionTextComponent = useMemo(() => {
    // Disputes may not include an embedded executable action
    if (!actionText && !loading) {
      return <DisputedActionNA />
    }

    const action = Array.isArray(executionPath) ? (
      <DisputeDetailDescription path={executionPath} />
    ) : (
      actionText
    )

    return url ? (
      <Link
        external
        href={url}
        css={`
          text-decoration: none;
          white-space: break-spaces;
          text-align: left;
        `}
      >
        {action}
      </Link>
    ) : (
      action
    )
  }, [actionText, executionPath, loading, url])

  return (
    <Field
      label="Disputed Action"
      loading={loading}
      value={ActionTextComponent}
      css={`
        word-break: break-word;
        overflow-wrap: anywhere;
      `}
    />
  )
}

function useDisputeFields(dispute) {
  const {
    agreementText,
    agreementUrl,
    defendant,
    disputable,
    organization,
    plaintiff,
    subject,
  } = dispute

  const creator = plaintiff || subject?.id

  const [
    {
      disputedActionRadspec,
      disputedActionText,
      disputedActionURL,
      executionPath,
    },
    loading,
  ] = useDisputedAction(dispute)

  const { disputedAction, description } = useMemo(() => {
    // Disputes created through agreements
    if (disputable) {
      return {
        disputedAction: disputedActionRadspec,
        description: disputable.actionContext,
      }
    }

    // Old disputes not created through agreements
    return {
      disputedAction: disputedActionText,
      description: disputedActionRadspec,
    }
  }, [disputable, disputedActionRadspec, disputedActionText])

  return {
    agreementText,
    agreementUrl,
    creator,
    defendant,
    description,
    disputable,
    disputedAction,
    disputedActionURL,
    executionPath,
    loading,
    organization,
  }
}

const DisputedActionNA = () => {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <span
        css={`
          margin-right: ${1 * GU}px;
        `}
      >
        N/A
      </span>
      <Help hint="">
        This dispute does not involve a binding action and is simply between the
        given context and arguments.
      </Help>
    </div>
  )
}

function useDisputedAction({
  id,
  disputable,
  disputedActionRadspec,
  disputedActionText,
  disputedActionURL,
  subject,
}) {
  const [disputedAction, setDisputedAction] = useState({
    disputedActionRadspec,
    disputedActionText,
    disputedActionURL,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If the dispute was not created through an agreement, the disputed action
    // descriptions should be already available (initialized above)
    if (!disputable) {
      return
    }

    let cancelled = false
    setLoading(true)

    const describeDispute = async () => {
      // Get disputable long and short description
      // as well as the URL where the disputed action is taking place
      const disputedActionDescription = await describeDisputedAction(
        id,
        disputable.organization,
        disputable.address,
        disputable.disputableActionId,
        subject.id
      )

      if (!cancelled) {
        setLoading(false)
        setDisputedAction(disputedActionDescription)
      }
    }

    describeDispute()

    return () => {
      cancelled = true
    }
  }, [disputable, id, subject])

  return [disputedAction, loading]
}

const Row = styled.div`
  display: grid;

  ${({ compactMode }) => `
    grid-gap: ${(compactMode ? 2.5 : 5) * GU}px;
    margin-bottom: ${compactMode ? 0 : 2 * GU}px;
    grid-template-columns: ${
      compactMode ? 'auto' : ''
    };
  `}
`


export default DisputeInfoContent
