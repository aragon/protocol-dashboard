import React from 'react'
import { GU, Link, textStyle, useTheme} from '@aragon/ui'
import { useWallet } from '../../providers/Wallet'
import { getIpfsCidFromUri, transformIPFSHash } from '../../lib/ipfs-utils'
import resolvePathname from 'resolve-pathname'
import { IPFS_ENDPOINT } from '../../endpoints'
import { addressesEqual, transformAddresses, toUTF8String } from '../../lib/web3-utils'
import IdentityBadge from '../IdentityBadge'
import Loading from '../Loading'

const MAX_LENGTH = 100;

// by default, if value is not ipfs hash|address type, it tries to transform
// the value into utf8string. To disable this, isUTF=false can be passed.
function Field({ label, loading, value, endpoint, isUTF8=true, ...props }) {
    const theme = useTheme()
    const wallet = useWallet()
  
    if (!value && !endpoint && !loading) {
      return <div />
    }
  
    return (
      <div {...props}>
        <h2
          css={`
            ${textStyle('label2')};
            color: ${theme.surfaceContentSecondary};
            margin-bottom: ${1 * GU}px;
          `}
        >
          {label}
        </h2>
        {(() => {
          if (loading) {
            return <Loading size="small" center={false} />
          }
  
          if (typeof value === 'string') {
            const ipfsPath = getIpfsCidFromUri(value)
            if (ipfsPath) {
              const ipfsUrl = resolvePathname(ipfsPath, `${IPFS_ENDPOINT}/`)
              return (
                <Link
                  href={ipfsUrl}
                  css={`
                    text-decoration: none;
                  `}
                >
                  Read more
                </Link>
              )
            }
  
            return value.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {transformAddresses(line, (part, isAddress, index) => 
                  isAddress ? (
                    <span title={part} key={index}>
                      <IdentityBadge
                        connectedAccount={addressesEqual(part, wallet.account)}
                        compact
                        entity={part}
                      />
                    </span>
                  ) : (
                    <React.Fragment key={index}>
                      {transformIPFSHash(part, (word, isIpfsHash, i) => {
                        if (isIpfsHash) {
                          const ipfsUrl = resolvePathname(
                            word,
                            `${IPFS_ENDPOINT}/`
                          )
                          return (
                            <Link
                              href={ipfsUrl}
                              key={i}
                              css={`
                                text-decoration: none;
                              `}
                            >
                              {word}
                            </Link>
                          )
                        }
                        return (
                          <React.Fragment key={index}>
                            <span key={i}>
                              { 
                                isUTF8 
                                ?  (endpoint ? `${toUTF8String(word).substring(0, MAX_LENGTH)}...` : toUTF8String(word))
                                :  (endpoint ? `${word.substring(0, MAX_LENGTH)}...` : word) 
                              } 
                            </span>
                            { endpoint && word.length > MAX_LENGTH 
                              && 
                                <Link
                                    href={endpoint}
                                    css={`
                                      text-decoration: none;
                                    `}
                                  >
                                    Read more
                                </Link>
                            }
                          </React.Fragment>
                        )
                      })}
                    </React.Fragment>
                  )
                )}
                <br />
              </React.Fragment>
            ))
          }
  
          if(endpoint) {
            return (
              <Link
                href={endpoint}
                css={`
                  text-decoration: none;
                `}
              >
                  Read more
              </Link>
            )
          }
  
          return (
            <div
              css={`
                ${textStyle('body2')};
              `}
            >
              {value}
            </div>
          )
        })()}
      </div>
    )
}

export default Field;
