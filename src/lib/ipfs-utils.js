import CID from 'cids'
import { defaultIpfsGateway } from '../endpoints'
import { toUTF8String } from './web3-utils'
import { create } from 'ipfs-http-client';

const SPLIT_IPFS_REGEX = /(Qm[a-zA-Z0-9]{44})/
const TEST_IPFS_REGEX = /(Qm[a-zA-Z0-9]{44})/

const REQUEST_TIMEOUT = 60000

let ipfs = null;

const FILE_EXTS = {
  text: 'txt',
};

const MIME_TYPES = ['text/plain'];

function createIpfs() {
  if (!ipfs) {
    ipfs = create({
      url: 'https://ipfs-0.aragon.network/api/v0',
      headers: {
        'X-API-KEY': 'yRERPRwFAb5ZiV94XvJdgvDKoGEeFerfFsAQ65',
      },
    });
  }
}

export const ipfsGet = async cid => {
  const endpoint = `${defaultIpfsGateway}/${cid}`
  
  try {
    const result = await fetch(endpoint, { timeout: REQUEST_TIMEOUT })
    
    return { result, endpoint, error: !result.ok }
  } catch (err) {
    console.error(`Error requesting data from IPFS for ${endpoint}`, err)
    return { error: true }
  }
}

export async function fetchIPFS(uriOrCid) {
  createIpfs();
  
  let cid = uriOrCid.replace(/^ipfs:/, '');
  cid = getIpfsCidFromUri(cid);
  if (!cid) {
    return null;
  }

  // endpoint/text can be array for supporting multiple files
  const data = {
    metadata: null,
    endpoint: null,
    text: null,
    error: null
  };

  try {
    for await (const file of ipfs.get(cid)) {
      // If the file type is dir, it's a directory,
      // so we need inside files
      if (file.type === 'dir') {
        continue;
      }

      if (file.type === 'file') {
        const content = [];

        for await (const chunk of file.content) {
          content.push(chunk);
        }

        if (file.path.includes('metadata')) {
          try {
            data.metadata = JSON.parse(new TextDecoder().decode(Buffer.concat(content)));
          } catch (err) {}
        } else {
          data.endpoint = defaultIpfsGateway + '/' + file.path;

          const extension = file.path.split('.').pop();
          // check if the extension exists and is of type `.txt`
          // to get the text representation by saving bandwith.
          if (Object.values(FILE_EXTS).includes(extension)) {
            try {
              data.text = new TextDecoder().decode(Buffer.concat(content));
            } catch (err) {}
          } // if the path name doesn't have .txt extension
          // or doesn't include path at all, fetch is needed
          // to determine the type and gets its text if it's text/plain
          else {
            const response = await fetch(defaultIpfsGateway + '/' + file.path);
            if (!response.ok) {
              data.error = !response.ok;
            }

            const blob = await response.clone().blob();

            if (MIME_TYPES.includes(blob.type)) {
              try {
                data.text = new TextDecoder().decode(content[0]);
              } catch (err) {}
            }
          }
        }
      }
    }
  } catch(err) {}

  return data;
}

export const getIpfsCidFromUri = string => {
  const cidString = string.replace(/^ipfs:/, '');
  // if cidString can be passed to CID class without throwing
  // it means it's the actual cid
  try {
    // eslint-disable-next-line no-new
    new CID(cidString);
    return cidString;
  } catch (err) {}

  // if cidString is ipfs v1 version hex from the cid's raw bytes and
  // we add `f` as a multibase prefix and remove `0x`
  try {
    const cid = `f${cidString.substring(2)}`;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  // if cidString is ipfs v0 version hex from the cid's raw bytes,
  // we add:
  // 1. 112 (0x70 in hex) which is dag-pb format.
  // 2. 01 because we want to use v1 version
  // 3. f since cidString is already hex, we only add `f` without converting anything.
  try {
    const cid = `f0170${cidString.substring(2)}`;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  // if cidString is hex received from string-to-hex converter
  try {
    const cid = toUTF8String(cidString) || cidString;
    // eslint-disable-next-line no-new
    new CID(cid);
    return cid;
  } catch (err) {}

  return ''
}

export function transformIPFSHash(str, callback) {
  return str
    .split(SPLIT_IPFS_REGEX)
    .map((part, index) => callback(part, TEST_IPFS_REGEX.test(part), index))
}
