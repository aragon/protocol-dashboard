import React from 'react'

import MessageCard from '../MessageCard'
import noDraftSvg from '../../assets/noDraft.svg'

function NoEvidence() {
  const title = ' The comments are being presented'
  const paragraph =
    'The involved parties have up to 7 days to submit comments supporting their case'

  return <MessageCard title={title} paragraph={paragraph} icon={noDraftSvg} />
}

export default NoEvidence
