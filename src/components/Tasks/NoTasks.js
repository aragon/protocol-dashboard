import React from 'react'
import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { NoData } from '../../utils/asset-utils'

function NoTasks() {
  const title = 'No tasks yet!'
  const noDataSvg = useAsset(NoData)
  return <MessageCard title={title} icon={noDataSvg} />
}

export default NoTasks
