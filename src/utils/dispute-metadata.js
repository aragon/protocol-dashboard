import { decode as GovernDisputeDecode } from './metadata/GovernDispute'
import { decode as DefaultDecoder } from './metadata/DefaultDispute';
import { DISPUTE_TYPES } from './metadata/types';

export  async function decodeMetadata(metadata) {
    let data = null;
    
    try {
       data = await DefaultDecoder(metadata)
       data.disputeType = DISPUTE_TYPES.DEFAULT;
       return data;
    }catch(err) {}

    try {
        data =  await GovernDisputeDecode(metadata);
        data.disputeType = DISPUTE_TYPES.GOVERN;
    }catch(err) {}
    
    return data;
}
