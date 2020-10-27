import React from 'react'

import MessageCard from '../MessageCard'
import noDraftSvg from '../../assets/noDraft.svg'

function NoEvidence() {
  const title = ' The evidence is being presented'
  const paragraph =
    'The involved parties have up to 7 days to submit evidence supporting their case'

  return <MessageCard title={title} paragraph={paragraph} icon={noDraftSvg} />
}

export default NoEvidence
