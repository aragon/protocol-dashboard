export const KnownArbitrables = {
  // TODO: Add honeypot
  main: new Map(
    [
      {
        address: '0x5b0899c8c5af7696ae4e082b04bd2920304ad2aa',
        urlBuilder: actionId =>
          `https://cash.aragon.network/#/proposals/${actionId}`,
      },
    ].map(arbitrable => [arbitrable.address.toLowerCase(), arbitrable])
  ),
  rinkeby: new Map(
    [
      {
        address: '0x9c92dbd8a8e5903e2741202321073091109f26be',
        urlBuilder: actionId =>
          `https://network-dashboard.vercel.app/#/proposals/${actionId}`,
      },
      {
        address: '0xc08d59bfe2337d45fa5e77ad8d683fd5bdfcde95',
        urlBuilder: actionId =>
          `https://honey-pot-git-disputable-version-1hive.vercel.app/#/proposal/${actionId}`,
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

export function buildArbitrableUrl(arbitrableAddress, actionId, networkType) {
  const arbitrable = KnownArbitrables[networkType].get(
    arbitrableAddress.toLowerCase()
  )

  return arbitrable?.urlBuilder(actionId) || ''
}
