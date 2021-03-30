import React from 'react'

import MessageCard from '../MessageCard'
import { useAsset } from '../../hooks/useAsset'
import { NO_RESULTS } from '../../utils/asset-utils'

function NoFilterResults({ onClearFilters }) {
  const title = 'No results found'
  const paragraph =
    'We couldn’t find any dispute matching your filter selection'

  const link = {
    text: 'Clear all filters',
    action: onClearFilters,
  }

  const noResultsSvg = useAsset(NO_RESULTS)

  return (
    <MessageCard
      title={title}
      paragraph={paragraph}
      icon={noResultsSvg}
      link={link}
    />
  )
}

export default NoFilterResults
