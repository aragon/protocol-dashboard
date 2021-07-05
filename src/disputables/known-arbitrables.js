export const KnownArbitrables = {
  rinkeby: new Map(
    [].map(arbitrable => [arbitrable.address.toLowerCase(), arbitrable])
  ),
  xdai: new Map(
    [
      {
        address: '0x59a15718992a42082ab2306bc6cbd662958a178c',
        urlBuilder: (actionId, entityPath) =>
          `https://1hive.org/#/${entityPath}/${actionId}`,
      },
    ].map(arbitrable => [arbitrable.address.toLowerCase(), arbitrable])
  ),
}

export function isArbitrableKnown(arbitrableAddress, networkType) {
  if (!KnownArbitrables[networkType]) return false
  return Boolean(
    KnownArbitrables[networkType].get(arbitrableAddress.toLowerCase())
  )
}

export function buildArbitrableUrl(
  arbitrableAddress,
  actionId,
  entityPath,
  networkType
) {
  const arbitrable = KnownArbitrables[networkType].get(
    arbitrableAddress.toLowerCase()
  )

  return arbitrable?.urlBuilder(actionId, entityPath) || ''
}
