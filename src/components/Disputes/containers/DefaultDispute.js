import React from 'react';

import { useIpfsFetch } from '../../../hooks/ipfs-hooks';
import Field from '../DisputeField';

function DefaultDisputeData({dispute}) {
    const description = useIpfsFetch(dispute.metadata.description) 
    const agreement = useIpfsFetch(dispute.metadata.agreement) 

    return (  
        <>
            <div>
                <Field
                    label="Description"
                    value={description?.text || description}
                    endpoint={description?.endpoint}
                    loading={!description}
                    css={`
                    word-break: break-word;
                    overflow-wrap: anywhere;
                    `} 
                />
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
            </div>
        </>
    )
}

export default DefaultDisputeData;