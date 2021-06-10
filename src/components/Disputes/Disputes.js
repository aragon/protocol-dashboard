import React, { useCallback, useState } from 'react'
import { Tabs, Tag } from '@aragon/ui'
import { useHistory } from 'react-router-dom'

import DisputeList from './DisputeList'
import TitleHeader from '../TitleHeader'
import useDisputes from '../../hooks/useDisputes'
import { useGuardianDraftQuery } from '../../hooks/query-hooks'
import { useWallet } from '../../providers/Wallet'

function Disputes() {
  const wallet = useWallet()
  const [screenIndex, setScreenIndex] = useState(0)
  const {
    disputes,
    fetching: disputesFetching,
    error: errorFetching,
  } = useDisputes()

  // Query for all dispute ids where the guardian has been drafted
  const guardianDisputeIds = useGuardianDraftQuery(wallet.account)

  const guardianDisputes = disputes?.filter(dispute =>
    guardianDisputeIds.includes(dispute.id)
  )

  const history = useHistory()
  const handleSelectDispute = useCallback(
    id => {
      history.push(`/disputes/${id}`)
    },
    [history]
  )

  const handleTabChange = screenIndex => {
    setScreenIndex(screenIndex)
  }

  return (
    <>
      <TitleHeader title="Disputes" />
      <Tabs
        items={[
          <div>
            <span>All disputes </span>
            <Tag
              limitDigits={4}
              label={disputes ? disputes.length : 0}
              size="small"
            />
          </div>,
          <div>
            <span>My disputes </span>
            <Tag
              limitDigits={4}
              label={guardianDisputes ? guardianDisputes.length : 0}
              size="small"
            />
          </div>,
        ]}
        selected={screenIndex}
        onChange={handleTabChange}
      />

      <DisputeList
        disputes={screenIndex === 0 ? disputes : guardianDisputes}
        loading={disputesFetching}
        errorLoading={errorFetching}
        myDisputeSelected={screenIndex === 1}
        onSelectDispute={handleSelectDispute}
      />
    </>
  )
}

export default Disputes
