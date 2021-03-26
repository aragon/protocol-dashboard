import CommentsLight from '../assets/light/Comments.svg'
import CommentsDark from '../assets/dark/Comments.svg'
import HomeBannerLight from '../assets/light/HomeBanner.png'
import HomeBannerDark from '../assets/dark/HomeBanner.png'
import IconDarkModeLight from '../assets/light/IconDarkMode.svg'
import IconDarkModeDark from '../assets/dark/IconDarkMode.svg'
import IconNetworkLight from '../assets/light/IconNetwork.svg'
import IconNetworkDark from '../assets/dark/IconNetwork.svg'
import IconNotificationsLight from '../assets/light/IconNotifications.svg'
import IconNotificationsDark from '../assets/dark/IconNotifications.svg'
import LogoLight from '../assets/light/HeaderLogo.svg'
import LogoDark from '../assets/dark/HeaderLogo.svg'
import NoDataLight from '../assets/light/NoData.svg'
import NoDataDark from '../assets/dark/NoData.svg'
import NoDraftLight from '../assets/light/NoDraft.svg'
import NoDraftDark from '../assets/dark/NoDraft.svg'

export const Comments = Symbol('COMMENTS')
export const HomeBanner = Symbol('HOME_BANNER')
export const IconDarkMode = Symbol('ICON_DARK_MODE')
export const IconNetwork = Symbol('ICON_NETWORK')
export const IconNotifications = Symbol('ICON_NOTIFICATIONS')
export const Logo = Symbol('LOGO')
export const NoDraft = Symbol('NO_DRAFT')
export const NoData = Symbol('NO_DATA')

export default {
  [Comments]: {
    light: CommentsLight,
    dark: CommentsDark,
  },
  [HomeBanner]: {
    light: HomeBannerLight,
    dark: HomeBannerDark,
  },
  [IconDarkMode]: {
    light: IconDarkModeLight,
    dark: IconDarkModeDark,
  },
  [IconNetwork]: {
    light: IconNetworkLight,
    dark: IconNetworkDark,
  },
  [IconNotifications]: {
    light: IconNotificationsLight,
    dark: IconNotificationsDark,
  },
  [Logo]: {
    light: LogoLight,
    dark: LogoDark,
  },
  [NoData]: {
    light: NoDataLight,
    dark: NoDataDark,
  },
  [NoDraft]: {
    light: NoDraftLight,
    dark: NoDraftDark,
  },
}
