import { decodeMetadata as GovernDisputeDecode, decodeEvidence as GovernEvidenceDecoder} from './metadata/GovernDispute'
import { decodeMetadata as DefaultDecoder, decodeEvidence as DefaultEvidenceDecoder } from './metadata/DefaultDispute';
import { DISPUTE_TYPES } from './metadata/types';

export function decodeMetadata(metadata) {
    let data = null;
    
    try {
       data = DefaultDecoder(metadata)
       data.disputeType = DISPUTE_TYPES.DEFAULT;
       return data;
    }catch(err) {}

    try {
        data = GovernDisputeDecode(metadata);
        data.disputeType = DISPUTE_TYPES.GOVERN;
        return data;
    }catch(err) {}
    
    return data;
}

export function decodeEvidence(evidenceMetadata) {
    let data = {
        label: null, 
        metadata: evidenceMetadata
    }

    try {
        data = DefaultEvidenceDecoder(evidenceMetadata)
        return data;
     }catch(err) {}
 
     try {
         data = GovernEvidenceDecoder(evidenceMetadata);
         return data;
     }catch(err) {}
     
     return data;
}
