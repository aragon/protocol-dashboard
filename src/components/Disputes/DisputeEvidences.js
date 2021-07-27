import React from 'react'
import { Accordion, GU, SyncIndicator, textStyle, useTheme, Link } from '@aragon/ui'
import { useWallet } from 'use-wallet'
import useEvidences from '../../hooks/useEvidences'
import { addressesEqual } from '../../lib/web3-utils'
import ErrorLoadingEvidence from './ErrorLoadingEvidence'
import IdentityBadge from '../IdentityBadge'
import Markdown from '../Markdown'
import { dateFormat } from '../../utils/date-utils'

import folderIcon from '../../assets/folderIcon.svg'

const DisputeEvidences = React.memo(function DisputeEvidences({
  dispute,
  evidences,
  loading,
}) {
  return (
    <React.Fragment>
      <SyncIndicator visible={loading} label="Loading evidences…" />
      {evidences &&
        evidences.map((evidence, index) => {
          const { createdAt, submitter, metadata, label, error } = evidence
          return (
            <Accordion
              key={index}
              items={[
                [
                  <div
                    css={`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <img src={folderIcon} width="17" height="20" alt="" />
                    <span
                      css={`
                        margin-left: ${1.5 * GU}px;
                      `}
                    >
                      {
                        // assume that the first evidence is always the original justification
                        label || (index === 0 ? 'Original justification' : `Dispute evidence ${index}`)
                      }
                    </span>
                  </div>,
                  <EvidenceContent
                    createdAt={createdAt}
                    error={error}
                    metadata={metadata}
                    submitter={submitter}
                  />,
                ],
              ]}
            />
          )
        })}
    </React.Fragment>
  )
})

const EvidenceContent = React.memo(function EvidenceContent({
  createdAt,
  submitter,
  metadata,
  error
}) {

  
  if( (!metadata.endpoint && !metadata.text) || metadata.text === '0x') {
    metadata = { text: 'This evidence has no data' }
  }
  
  const theme = useTheme()
  const wallet = useWallet()

  if (error) {
    return <ErrorLoadingEvidence />
  }
  return (
    <div
      css={`
        margin-bottom: ${2 * GU}px;
        padding: ${3 * GU}px ${8 * GU - 3}px;
      `}
    >
      <div
        css={`
          display: grid;
          grid-template-columns: 150px minmax(180px, auto);
          grid-gap: ${5 * GU}px;
          margin-bottom: ${5 * GU}px;
        `}
      >
        <div>
          <h2
            css={`
              ${textStyle('label2')};
              color: ${theme.surfaceContentSecondary};
              margin-bottom: ${2 * GU}px;
            `}
          >
            Submitted by
          </h2>
          <div
            css={`
              display: flex;
              align-items: flex-start;
            `}
          >
            <IdentityBadge
              connectedAccount={addressesEqual(submitter, wallet.account)}
              entity={submitter}
              label={submitter}
            />
          </div>
        </div>
        <div>
          <h2
            css={`
              ${textStyle('label2')};
              color: ${theme.surfaceContentSecondary};
              margin-bottom: ${2 * GU}px;
            `}
          >
            Date
          </h2>
          <span
            css={`
              ${textStyle('body2')};
            `}
          >
            {dateFormat(createdAt, 'onlyDate')}
          </span>
        </div>
      </div>
      <div>
        <h2
          css={`
            ${textStyle('label2')};
            color: ${theme.surfaceContentSecondary};
            margin-bottom: ${2 * GU}px;
          `}
        >
          Data
        </h2>
        <div
          css={`
            display: flex;
            align-items: flex-start;
          `}
        >
          { metadata.endpoint &&
              <Link
                href={metadata.endpoint}
                css={`
                  text-decoration: none;
                `}
              >
              Open
              </Link>
          }
        </div>
        <div
          css={`
            display: flex;
            align-items: flex-start;
          `}
        >
          {metadata.text && <Markdown text={metadata.text} /> }
        </div>
      </div>
    </div>
  )
})


export default function Evidences({ dispute, evidences }) {
  // This hook ensures us that evidenceProcessed won't be updated unless there are new evidences.
  const [evidenceProcessed, fetchingEvidences] = useEvidences(
    dispute,
    evidences
  )

  return (
    <DisputeEvidences
      evidences={evidenceProcessed}
      dispute={dispute}
      loading={fetchingEvidences}
    />
  )
}
