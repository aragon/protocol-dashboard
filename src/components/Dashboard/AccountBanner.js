import React from 'react'
import { animated, useSpring } from 'react-spring'
import { GU, Help, LoadingRing, useTheme } from '@aragon/ui'

import AccountBannerInfo from './AccountBannerInfo'
import CircleGraph from '../CircleGraph'
import { useTotalActiveBalance } from '../../hooks/useCourtStats'
import { useGuardianFirstTimeANTActivation } from '../../hooks/useANT'
import { useCourtConfig } from '../../providers/CourtConfig'

import { ACCOUNT_STATUS_GUARDIAN_ACTIVE } from '../../types/account-status-types'
import { formatUnits, getPercentageBN, bigNum } from '../../lib/math-utils'

import antSpringIcon from '../../assets/IconANTSpring.svg'
import userIcon from '../../assets/IconUser.svg'
import hexagonIcon from '../../assets/IconHexagonGreen.svg'
import { useGuardianDrafted } from '../../hooks/useGuardianDrafted'

const getBannerAttributes = (
  status,
  drafted,
  isFirstTimeActivating,
  minActiveBalance,
  decimals,
  theme
) => {
  if (status === ACCOUNT_STATUS_GUARDIAN_ACTIVE) {
    // NOTE: This one could not be included in the final version
    if (drafted) {
      return {
        icon: hexagonIcon,
        iconBackground: theme.positive.alpha(0.2),
        title: 'You have been summoned',
        titleColor: theme.positive,
        paragraph:
          'You can start reviewing the evidence and then commit your vote',
      }
    }

    if (isFirstTimeActivating) {
      return {
        icon: userIcon,
        iconBackground: theme.positive.alpha(0.2),
        title: 'You are eligible to be summoned',
        titleColor: theme.positive,
        paragraph:
          'You are eligible to be summoned starting from the next term',
        showTimer: true,
      }
    }

    return { showProbability: true }
  }

  return {
    icon: antSpringIcon,
    title: 'Activate ANT to be an active guardian',
    paragraph: `You must activate at least ${formatUnits(minActiveBalance, {
      digits: decimals,
    })}  ANT to participate as a guardian`,
  }
}

function AccountBanner({ status, loading, minActiveBalance, activeBalance }) {
  const theme = useTheme()
  const { token: antToken } = useCourtConfig()

  // check if guardian has been drafted in this current term
  const isGuardianDrafted = useGuardianDrafted({
    pause: status !== ACCOUNT_STATUS_GUARDIAN_ACTIVE,
  })

  // check if it's the first time activating ANT
  const isFirstTimeActivating = useGuardianFirstTimeANTActivation({
    pause: isGuardianDrafted || status !== ACCOUNT_STATUS_GUARDIAN_ACTIVE,
  })

  const attributes = getBannerAttributes(
    status,
    isGuardianDrafted,
    isFirstTimeActivating,
    minActiveBalance,
    antToken.decimals,
    theme
  )

  if (loading) {
    return <BannerLoadingRing />
  }
  if (attributes.showProbability) {
    return <BannerWithProbability activeBalance={activeBalance} />
  }
  const {
    icon,
    title,
    titleColor,
    paragraph,
    iconBackground,
    showTimer,
  } = attributes

  return (
    <Wrapper
      mainIcon={
        <div
          css={`
            display: flex;
            align-items: center;
            background: ${iconBackground};
            height: ${7 * GU}px;
            width: ${iconBackground ? 7 * GU + 'px' : 'auto'};
            border-radius: 50%;
          `}
        >
          <img
            css={`
              display: block;
              margin: 0 auto;
            `}
            height={iconBackground ? 3 * GU : 6 * GU}
            src={icon}
            alt=""
          />
        </div>
      }
      information={
        <AccountBannerInfo
          title={title}
          titleColor={titleColor}
          paragraph={paragraph}
          showTimer={showTimer}
        />
      }
    />
  )
}

const Wrapper = ({ mainIcon, information }) => {
  const springProps = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    delay: 200,
  })

  return (
    <animated.div
      style={springProps}
      css={`
        display: flex;
      `}
    >
      <div
        css={`
          margin-right: ${1.5 * GU}px;
        `}
      >
        {mainIcon}
      </div>
      {information}
    </animated.div>
  )
}

const BannerWithProbability = ({ activeBalance }) => {
  const theme = useTheme()
  const [totalActiveBalanceCurrentTerm] = useTotalActiveBalance()

  const fetchingTotalBalance = totalActiveBalanceCurrentTerm.eq(bigNum(-1))
  if (fetchingTotalBalance) {
    return <BannerLoadingRing />
  }

  // Calculate guardian's active balance and total active balance for current term
  const {
    amount: activeAmount,
    amountNotEffective: activeAmountNotEffective,
  } = activeBalance
  const activeBalanceCurrentTerm = activeAmount.sub(activeAmountNotEffective)
  const totalPercentage = getPercentageBN(
    activeBalanceCurrentTerm,
    totalActiveBalanceCurrentTerm
  )

  // Calculate probability (since the total active balance is asynchronous
  // it can happen that it has not been updated yet when the guardian active balance has)
  const draftingProbability = Math.min(1, totalPercentage / 100)
  const probablilityTooLow = totalPercentage < 1

  const chances = probablilityTooLow
    ? '100+'
    : totalPercentage > 0 && Math.floor(100 / totalPercentage)

  const title = (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <span
        css={`
          margin-right: ${1 * GU}px;
        `}
      >
        {'On average, you will be summoned into a guardian '}
        <span
          css={`
            color: ${theme.accent};
          `}
        >
          1 in {chances} times
        </span>
      </span>
      <Help hint="How is the probability calculated?">
        <p>
          This is a numerical estimate of your likelihood of being selected for
          arbitration. It’s calculated by dividing your active ANT balance
          against the court's total active ANT balance during the current term.
        </p>
        <p
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          {probablilityTooLow
            ? `
                You currently have <1% of all activated ANT, hence are unlikely
                to be summoned unless a dispute goes to the final round or many
                disputes are created. Activate more ANT to increase your chances
                of being selected as a guardian.
              `
            : `
                You can always activate more ANT to increase your chances of
                being selected as a guardian.
              `}
        </p>
      </Help>
    </div>
  )

  const paragraph =
    'The more ANT you activate, the more likely you will be summoned to arbitrate a dispute'

  return (
    <Wrapper
      mainIcon={<CircleGraph value={draftingProbability} size={7 * GU} />}
      information={<AccountBannerInfo title={title} paragraph={paragraph} />}
    />
  )
}

function BannerLoadingRing() {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        height: ${7 * GU}px;
      `}
    >
      <LoadingRing />
    </div>
  )
}

export default AccountBanner
