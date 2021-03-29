import { decode as GovernDisputeDecode } from './metadata/GovernDispute'

export  async function decodeMetadata(metadata, party = 'Govern') {
    if(party === 'Govern') {
       const data =  await GovernDisputeDecode(metadata);
       return data;
    }
}