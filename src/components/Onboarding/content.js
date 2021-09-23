import React from 'react'
import { Link } from '@1hive/1hive-ui'

import large1 from './highlights/assets/rinkeby/large/light/1.png'
import large2 from './highlights/assets/rinkeby/large/light/2.png'
import large3 from './highlights/assets/rinkeby/large/light/3.png'
import large4 from './highlights/assets/rinkeby/large/light/4.png'
import large5 from './highlights/assets/rinkeby/large/light/5.png'
import large6 from './highlights/assets/rinkeby/large/light/6.png'

import largeDark1 from './highlights/assets/rinkeby/large/dark/1.png'
import largeDark2 from './highlights/assets/rinkeby/large/dark/2.png'
import largeDark3 from './highlights/assets/rinkeby/large/dark/3.png'
import largeDark4 from './highlights/assets/rinkeby/large/dark/4.png'
import largeDark5 from './highlights/assets/rinkeby/large/dark/5.png'
import largeDark6 from './highlights/assets/rinkeby/large/dark/6.png'

import mainnetLarge1 from './highlights/assets/mainnet/large/light/1.png'
import mainnetLarge2 from './highlights/assets/mainnet/large/light/2.png'
import mainnetLarge3 from './highlights/assets/mainnet/large/light/3.png'
import mainnetLarge4 from './highlights/assets/mainnet/large/light/4.png'
import mainnetLarge5 from './highlights/assets/mainnet/large/light/5.png'
import mainnetLarge6 from './highlights/assets/mainnet/large/light/6.png'
import mainnetLarge7 from './highlights/assets/mainnet/large/light/7.png'

import mainnetLargeDark1 from './highlights/assets/mainnet/large/dark/1.png'
import mainnetLargeDark2 from './highlights/assets/mainnet/large/dark/2.png'
import mainnetLargeDark3 from './highlights/assets/mainnet/large/dark/3.png'
import mainnetLargeDark4 from './highlights/assets/mainnet/large/dark/4.png'
import mainnetLargeDark5 from './highlights/assets/mainnet/large/dark/5.png'
import mainnetLargeDark6 from './highlights/assets/mainnet/large/dark/6.png'
import mainnetLargeDark7 from './highlights/assets/mainnet/large/dark/7.png'

import mainnetSmall1 from './highlights/assets/mainnet/small/light/1.png'
import mainnetSmall2 from './highlights/assets/mainnet/small/light/2.png'
import mainnetSmall3 from './highlights/assets/mainnet/small/light/3.png'
import mainnetSmall4 from './highlights/assets/mainnet/small/light/4.png'
import mainnetSmall5 from './highlights/assets/mainnet/small/light/5.png'
import mainnetSmall6 from './highlights/assets/mainnet/small/light/6.png'
import mainnetSmall7 from './highlights/assets/mainnet/small/light/7.png'

import mainnetSmallDark1 from './highlights/assets/mainnet/small/dark/1.png'
import mainnetSmallDark2 from './highlights/assets/mainnet/small/dark/2.png'
import mainnetSmallDark3 from './highlights/assets/mainnet/small/dark/3.png'
import mainnetSmallDark4 from './highlights/assets/mainnet/small/dark/4.png'
import mainnetSmallDark5 from './highlights/assets/mainnet/small/dark/5.png'
import mainnetSmallDark6 from './highlights/assets/mainnet/small/dark/6.png'
import mainnetSmallDark7 from './highlights/assets/mainnet/small/dark/7.png'

const TYPEFORM_LINK = 'https://t0ybf228z8j.typeform.com/to/bCQP2NAS'
const MAIN_COURT_URL = 'https://celeste.1hive.org'

const highlights = {
  heading: 'Celeste',
  light: {
    defaultVisualColor: '#FF9780',
    defaultButtonColor: '#FFFFFF',
  },
  dark: {
    defaultVisualColor: '#171551',
    defaultButtonColor: '#FFFFFF',
  },
}

highlights.rinkeby = [
  {
    title: {
      small: null,
      large: 'Welcome 👋',
    },
    description: {
      small: null,
      large: (
        <span>
          This is a testnet release of the official Celeste at{' '}
          <Link href={MAIN_COURT_URL}>celeste.1hive.org</Link>. We'd love for
          you to explore it and tell us what you think!
        </span>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large1,
      },
      dark: {
        small: null,
        large: largeDark1,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Getting Rinkeby HNY',
    },
    description: {
      small: null,
      large: (
        <span>
          If you would like to participate in the testing phase and answer
          disputes as a keeper, just complete
          <Link href={TYPEFORM_LINK}>this form</Link> and we’ll send you some
          funds swiftly! We'll ask fo your Discord username and Rinkeby address
          and you'll get some sweet test 🍯 !
        </span>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large2,
      },
      dark: {
        small: null,
        large: largeDark2,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Upcoming tasks',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            When drafted, you must perform certain actions on time to earn
            rewards and avoid penalties.
          </p>
          <p>
            Check your pending actions in the Upcoming tasks section so you
            always know what to do.
          </p>
        </>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large3,
      },
      dark: { small: null, large: largeDark3 },
    },
  },
  {
    title: {
      small: null,
      large: 'Dispute analysis',
    },
    description: {
      small: null,
      large: (
        <span>
          Upon viewing a dispute you will find the essential information
          required to assess the dispute before casting your vote or making an
          appeal.
        </span>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large4,
      },
      dark: {
        small: null,
        large: largeDark4,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Dispute list',
    },
    description: {
      small: null,
      large: (
        <span>
          View all live disputes or only ones you are adjudicating. From here
          you can explore the details, comments, and timeline for any dispute.
        </span>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large5,
      },
      dark: { small: null, large: largeDark5 },
    },
  },
  {
    title: {
      small: null,
      large: 'Earn rewards 🏆',
    },
    description: {
      small: null,
      large: (
        <span>
          When you vote in favor of the plurality ruling, you will be rewarded
          with Dispute Fees. Just note that these rewards will be awarded in
          Rinkeby tokens for the purpose of this test version.
        </span>
      ),
    },
    visual: {
      light: {
        small: null,
        large: large6,
      },
      dark: {
        small: null,
        large: largeDark6,
      },
    },
    start: {
      small: null,
      large: 'Discover Celeste',
    },
  },
]

highlights.xdai = [
  {
    title: {
      small: null,
      large: 'Welcome 👋',
    },
    description: {
      small: null,
      large: (
        <span>
          Read the quick guide on how to be a good and active keeper and explore
          the different disputes taking place on Celeste.
        </span>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall1,
        large: mainnetLarge1,
      },
      dark: {
        small: mainnetSmallDark1,
        large: mainnetLargeDark1,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Balances 📊',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            View and manage your HNY across three balances: Wallet, Inactive,
            and Active. You can read more about these different balances and
            what they mean in the{' '}
            <Link href="https://1hive.gitbook.io/celeste/keepers/keeper-dashboard">
              Celeste Dashboard Guide
            </Link>
            .
          </p>
          <p>
            Adjusting your active HNY balance will affect the indicator that
            displays your chance of being drafted, and current draft status.
          </p>
        </>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall2,
        large: mainnetLarge2,
        color: '#F9FAFC',
        buttonColor: '#8E54A5',
      },
      dark: {
        small: mainnetSmallDark2,
        large: mainnetLargeDark2,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Buying HNY 🍯 ',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            HNY is the native token for Celeste and helps ensure keepers are
            properly motivated to do their jobs well.
          </p>
          <p>
            You can convert DAI, ETH, or USDC to HNY using the module at
            honeyswap.org or clicking by ‘Buy HNY.’
          </p>
        </>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall3,
        large: mainnetLarge3,
      },
      dark: {
        small: mainnetSmallDark3,
        large: mainnetLargeDark3,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Upcoming tasks',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            When drafted, you must perform certain actions on time to earn
            rewards and avoid penalties.
          </p>
          <p>
            Check your pending actions in the Upcoming tasks section so you
            always know what to do.
          </p>
        </>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall4,
        large: mainnetLarge4,
      },
      dark: {
        small: mainnetSmallDark4,
        large: mainnetLargeDark4,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Dispute list',
    },
    description: {
      small: null,
      large: (
        <span>
          View all live disputes or only ones you are adjudicating. From here
          you can explore the details, comments, and timeline for any dispute.
        </span>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall5,
        large: mainnetLarge5,
      },
      dark: {
        small: mainnetSmallDark5,
        large: mainnetLargeDark5,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Dispute analysis',
    },
    description: {
      small: null,
      large: (
        <span>
          Upon viewing a dispute you will find the essential information
          required to assess the dispute before casting your vote or making an
          appeal.
        </span>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall6,
        large: mainnetLarge6,
      },
      dark: {
        small: mainnetSmallDark6,
        large: mainnetLargeDark6,
      },
    },
  },
  {
    title: {
      small: null,
      large: 'Earn rewards 🏆 ',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            Earn Dispute rewards for successfully adjudicating disputes and
            monthly Staking rewards for simply being an Active keeper, whether
            you are drafted or not.
          </p>
          <p>Use the Rewards modules to track your earnings over time.</p>
        </>
      ),
    },
    visual: {
      light: {
        small: mainnetSmall7,
        large: mainnetLarge7,
      },
      dark: {
        small: mainnetSmallDark7,
        large: mainnetLargeDark7,
      },
    },
    start: {
      small: null,
      large: 'Discover Celeste',
    },
  },
]

export { highlights }
