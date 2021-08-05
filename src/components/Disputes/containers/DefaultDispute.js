import React from 'react';

import { useIpfsFetch } from '../../../hooks/ipfs-hooks';
import Field from '../DisputeField';
import { toUTF8String } from '../../../lib/web3-utils'

function DefaultDisputeData({dispute}) {
    const description = useIpfsFetch(dispute.metadata.description) 
    const agreement = useIpfsFetch(dispute.metadata.agreement) 

    return (  
        <>
            <div>
                <Field
                    label="Description"
                    value={description?.text || toUTF8String(description)}
                    endpoint={description?.endpoint}
                    loading={!description}
                    css={`
                    word-break: break-word;
                    overflow-wrap: anywhere;
                    `} 
                />
                <br />
                <Field
                    label="Agreement"
                    value={agreement?.text || agreement}
                    endpoint={agreement?.endpoint}
                    loading={!agreement}
                    css={`
                    word-break: break-word;
                    overflow-wrap: anywhere;
                    `} 
                />
                <br />
                <Field
                    label="Dispute Creator"
                    value={dispute?.metadata?.disputeCreator}
                    css={`
                    word-break: break-word;
                    overflow-wrap: anywhere;
                    `} 
                />
            </div>
        </>
    )
}

export default DefaultDisputeData;
