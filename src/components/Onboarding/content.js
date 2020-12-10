import React from 'react'
import { Link } from '@1hive/1hive-ui'

import large1 from './highlights/assets/rinkeby/large/1.png'
import large2 from './highlights/assets/rinkeby/large/2.png'
import large3 from './highlights/assets/rinkeby/large/3.png'
import large4 from './highlights/assets/rinkeby/large/4.png'
import large5 from './highlights/assets/rinkeby/large/5.png'

import mainnetLarge1 from './highlights/assets/mainnet/large/1.png'
import mainnetLarge2 from './highlights/assets/mainnet/large/2.png'
import mainnetLarge3 from './highlights/assets/mainnet/large/3.png'
import mainnetLarge4 from './highlights/assets/mainnet/large/4.png'
import mainnetLarge5 from './highlights/assets/mainnet/large/5.png'
import mainnetLarge6 from './highlights/assets/mainnet/large/6.png'
import mainnetLarge7 from './highlights/assets/mainnet/large/7.png'

import mainnetSmall1 from './highlights/assets/mainnet/small/1.png'
import mainnetSmall2 from './highlights/assets/mainnet/small/2.png'
import mainnetSmall3 from './highlights/assets/mainnet/small/3.png'
import mainnetSmall4 from './highlights/assets/mainnet/small/4.png'
import mainnetSmall5 from './highlights/assets/mainnet/small/5.png'
import mainnetSmall6 from './highlights/assets/mainnet/small/6.png'
import mainnetSmall7 from './highlights/assets/mainnet/small/7.png'

const TYPEFORM_LINK = 'https://aragonone.typeform.com/to/g7zncn'
const MAIN_COURT_URL = 'https://court.aragon.org' // TODO:(fabri) Update urls

const highlights = {
  heading: 'Celeste',
  defaultVisualColor: '#8E54A5',
  defaultButtonColor: '#FFFFFF',
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
          <Link href={MAIN_COURT_URL}>court.aragon.org</Link>. We'd love for you
          to explore it and tell us what you think!
        </span>
      ),
    },
    visual: {
      small: null,
      large: large1,
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
          We’ve airdropped 10,000 test HNY on Rinkeby to the same Ethereum
          account you registered with on xDai. You can use this test HNY to
          become an active participant and be involved in the arbitration
          process.
        </span>
      ),
    },
    visual: {
      small: null,
      large: large2,
      color: '#F9FAFC',
      buttonColor: '#8E54A5',
    },
  },
  {
    title: {
      small: null,
      large: 'Participate on your first question',
    },
    description: {
      small: null,
      large: (
        <span>
          Once you start exploring, you will find some mock questions with
          realistic content that will allow you to become familiar with the
          functionality of this dashboard.
        </span>
      ),
    },
    visual: {
      small: null,
      large: large3,
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
          with Question Fees. Just note that these rewards will be awarded in
          Rinkeby tokens for the purpose of this test version.
        </span>
      ),
    },
    visual: {
      small: null,
      large: large4,
    },
  },
  {
    title: {
      small: null,
      large: 'Stay up to date!',
    },
    description: {
      small: null,
      large: (
        <>
          <p>
            If you didn’t receive any Rinkeby HNY, just complete
            <Link href={TYPEFORM_LINK}>this form</Link> and we’ll send you some
            funds swiftly!
          </p>
          <p>
            You’ll also receive notifications about important announcements,
            your assigned questions, and upcoming tasks as a pacrticipant.
          </p>
        </>
      ),
    },
    visual: {
      small: null,
      large: large5,
    },
    start: {
      small: null,
      large: 'Discover Celeste',
    },
  },
]

highlights.main = [
  {
    title: {
      small: null,
      large: 'Welcome 👋',
    },
    description: {
      small: null,
      large: (
        <span>
          Your first HNY has been activated succesfully. Now, read the quick
          guide to be a good and active participant on Celeste.
        </span>
      ),
    },
    visual: {
      small: mainnetSmall1,
      large: mainnetLarge1,
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
            <Link href="https://help.aragon.org/article/42-aragon-court-dashboard">
              {/* TODO: Update link */}
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
      small: mainnetSmall2,
      large: mainnetLarge2,
      color: '#F9FAFC',
      buttonColor: '#8E54A5',
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
      small: mainnetSmall3,
      large: mainnetLarge3,
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
      small: mainnetSmall4,
      large: mainnetLarge4,
    },
  },
  {
    title: {
      small: null,
      large: 'Question list',
    },
    description: {
      small: null,
      large: (
        <span>
          View all live questions or only ones your adjudicating. From here you
          can explore the details, comments, and timeline for any question.
        </span>
      ),
    },
    visual: {
      small: mainnetSmall5,
      large: mainnetLarge5,
    },
  },
  {
    title: {
      small: null,
      large: 'Question analysis',
    },
    description: {
      small: null,
      large: (
        <span>
          Upon viewing a question you will find the essential information
          required to assess the question before casting your vote or making an
          appeal.
        </span>
      ),
    },
    visual: {
      small: mainnetSmall6,
      large: mainnetLarge6,
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
            Earn Question Fees for successfully adjudicating questions and
            monthy Subscription Fees for simply being an Active participant,
            whether you are drafted or not.
          </p>
          <p>Use the Rewards modules to track your earnings over time.</p>
        </>
      ),
    },
    visual: {
      small: mainnetSmall7,
      large: mainnetLarge7,
    },
    start: {
      small: null,
      large: 'Discover Celeste',
    },
  },
]

export { highlights }
