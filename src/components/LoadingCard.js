import React from 'react'
import MessageCard from './MessageCard'
import { useAsset } from '../hooks/useAsset'
import { LOADING } from '../utils/asset-utils'

function LoadingCard({ border }) {
  const loadingSvg = useAsset(LOADING)
  return <MessageCard icon={loadingSvg} loading border={border} />
}

export default LoadingCard
