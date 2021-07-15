import { useState, useEffect } from 'react'
import { fetchIPFS } from '../lib/ipfs-utils'

export function useIpfsFetch(cid) {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        async function fetch() {
            const data = await fetchIPFS(cid)
            if(data) {
                setData(data);
            }
        }
        fetch();
    }, [cid])

    return data;
}
