import HomeBannerLight from '../assets/HomeBanner.png'
import HomeBannerDark from '../assets/HomeBannerDark.png'
import LogoLight from '../assets/HeaderLogo.svg'
import LogoDark from '../assets/HeaderLogoDark.svg'

export const Logo = Symbol('LOGO')
export const HomeBanner = Symbol('HOME_BANNER')

export default {
  [HomeBanner]: {
    light: HomeBannerLight,
    dark: HomeBannerDark,
  },
  [Logo]: {
    light: LogoLight,
    dark: LogoDark,
  },
}
