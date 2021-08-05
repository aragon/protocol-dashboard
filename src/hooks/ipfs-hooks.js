import { useState, useEffect } from 'react'
import { fetchIPFS, getIpfsCidFromUri } from '../lib/ipfs-utils'

export function useIpfsFetch(cid) {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        async function fetch() {
            const data = await fetchIPFS(cid)
            if(data) {
                setData(data);
            }
        }
        if(getIpfsCidFromUri(cid)) {
            fetch();
        } else {
            setData(cid);
        }
    }, [cid])

    return data;
}
