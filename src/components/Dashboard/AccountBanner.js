import React, { useMemo } from 'react'
import { animated, useSpring } from 'react-spring'
import { GU, Help, LoadingRing, useTheme } from '@1hive/1hive-ui'

import AccountBannerInfo from './AccountBannerInfo'
import CircleGraph from '../CircleGraph'
import { useAsset } from '../../hooks/useAsset'
import { useCourtConfig } from '../../providers/CourtConfig'
import { useJurorDrafted } from '../../hooks/useJurorDrafted'
import { useJurorFirstTimeHNYActivation } from '../../hooks/useHNY'
import { useTotalActiveBalance } from '../../hooks/useCourtStats'

import { ACCOUNT_STATUS_JUROR_ACTIVE } from '../../types/account-status-types'
import { formatUnits, getPercentageBN, bigNum } from '../../lib/math-utils'
import { ICON_HNY_SPRING, ICON_USER, ICON_WARP } from '../../utils/asset-utils'

const useBannerAttributes = (
  status,
  drafted,
  isFirstTimeActivating,
  minActiveBalance,
  decimals,
  theme
) => {
  const hnySpringIcon = useAsset(ICON_HNY_SPRING)
  const userIcon = useAsset(ICON_USER)
  const warpIcon = useAsset(ICON_WARP)

  return useMemo(() => {
    if (status === ACCOUNT_STATUS_JUROR_ACTIVE) {
      // NOTE: This one could not be included in the final version
      if (drafted) {
        return {
          icon: warpIcon,
          title: 'You have been drafted',
          titleColor: theme.positive,
          paragraph:
            'You can start reviewing the comments and then commit your vote',
        }
      }

      if (isFirstTimeActivating) {
        return {
          icon: userIcon,
          title: 'You are eligible to be drafted',
          titleColor: theme.positive,
          paragraph:
            'You are eligible to be drafted starting from the next term',
          showTimer: true,
        }
      }

      return { showProbability: true }
    }

    return {
      icon: hnySpringIcon,
      title: 'Activate HNY to be an active keeper',
      paragraph: `You must activate at least ${formatUnits(minActiveBalance, {
        decimals,
      })}  HNY to participate as a keeper`,
    }
  }, [
    decimals,
    drafted,
    hnySpringIcon,
    isFirstTimeActivating,
    minActiveBalance,
    status,
    theme.positive,
    userIcon,
    warpIcon,
  ])
}

function AccountBanner({ status, loading, minActiveBalance, activeBalance }) {
  const theme = useTheme()
  const { anjToken } = useCourtConfig()

  // check if juror has been drafted in this current term
  const isJurorDrafted = useJurorDrafted({
    pause: status !== ACCOUNT_STATUS_JUROR_ACTIVE,
  })

  // check if it's the first time activating HNY
  const isFirstTimeActivating = useJurorFirstTimeHNYActivation({
    pause: isJurorDrafted || status !== ACCOUNT_STATUS_JUROR_ACTIVE,
  })

  const attributes = useBannerAttributes(
    status,
    isJurorDrafted,
    isFirstTimeActivating,
    minActiveBalance,
    anjToken.decimals,
    theme
  )

  if (loading) {
    return <BannerLoadingRing />
  }
  if (attributes.showProbability) {
    return <BannerWithProbability activeBalance={activeBalance} />
  }
  const { icon, title, titleColor, paragraph, showTimer } = attributes

  return (
    <Wrapper
      mainIcon={
        <div
          css={`
            display: flex;
            align-items: center;
            height: ${7 * GU}px;
            border-radius: 50%;
          `}
        >
          <img
            css={`
              display: block;
              margin: 0 auto;
            `}
            height={8 * GU}
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

  // Calculate juror's active balance and total active balance for current term
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
  // it can happen that it has not been updated yet when the juror active balance has)
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
        {'On average, you will be drafted into a keeper '}
        <span
          css={`
            color: ${theme.tagIndicatorContent};
          `}
        >
          1 in {chances} times
        </span>
      </span>
      <Help hint="How is the probability calculated?">
        <p>
          This is a numerical estimate of your likelihood of being selected for
          answering disputes. It’s calculated by dividing your active HNY
          balance against the Celeste's total active HNY balance during the
          current term.
        </p>
        <p
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          {probablilityTooLow
            ? `
                You currently have <1% of all activated HNY, hence are unlikely
                to be drafted unless a dispute goes to the final round or many
                disputes are created. Activate more HNY to increase your chances
                of being selected as a keeper.
              `
            : `
                You can always activate more HNY to increase your chances of
                being selected as a keeper.
              `}
        </p>
      </Help>
    </div>
  )

  const paragraph =
    'The more HNY you activate, the more likely you will be drafted to answer a dispute'

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
