import React, { useMemo } from 'react'
import { Button, GU, Help, textStyle, useTheme } from '@1hive/1hive-ui'
import { animated, useSpring } from 'react-spring'

import Loading from '../Loading'
import HNYLockedDistribution from './HNYLockedDistribution'
import SplitAmount from '../SplitAmount'

import { useCourtConfig } from '../../providers/CourtConfig'
import { useHNYAmountToUsd } from '../../hooks/useTokenAmountToUsd'

import { PCT_BASE } from '../../utils/dispute-utils'
import { bigNum, formatTokenAmount, formatUnits } from '../../lib/math-utils'
import { movementDirection, convertToString } from '../../types/anj-types'

import HNYIcon from '../../assets/IconHNY.svg'
import lockIcon from '../../assets/IconLock.svg'

const Balance = React.memo(function Balance({
  label,
  amount,
  loading,
  actions,
  mainIcon,
  activity,
  distribution,
}) {
  const theme = useTheme()
  const {
    anjToken: { symbol, decimals },
  } = useCourtConfig()

  const convertedAmount = useHNYAmountToUsd(amount)

  const springProps = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    delay: 300,
  })

  return (
    <div>
      <div
        css={`
          border-bottom: 1px solid ${theme.border.alpha(0.7)};
        `}
      >
        {loading ? (
          <Loading height={86} size="large" />
        ) : (
          <animated.div
            style={springProps}
            css={`
              display: flex;
              align-items: flex-start;
              padding-bottom: ${2 * GU}px;
            `}
          >
            <img
              css={`
                display: block;
                margin-right: ${2 * GU}px;
              `}
              src={mainIcon}
              height={6 * GU}
              width={6 * GU}
            />
            <div>
              <span
                css={`      
                ${textStyle('body2')}
                color: ${theme.surfaceContentSecondary};
                display:block;
              `}
              >
                {label}
              </span>
              <div
                css={`
                  ${textStyle('title3')}
                  line-height: 1.2;
                  display: flex;
                  align-items: center;
                `}
              >
                <SplitAmount
                  amount={formatUnits(amount, { digits: decimals })}
                />
                <img height="20" width="18" src={HNYIcon} alt="HNY" />
              </div>
              <span
                css={`
                ${textStyle('body4')}
                color: ${theme.surfaceContentSecondary};
                display:block;
              `}
              >
                $ {convertedAmount}
              </span>
            </div>
          </animated.div>
        )}
      </div>
      {loading ? (
        <div
          css={`
            height: 96px;
          `}
        />
      ) : (
        <animated.div style={springProps}>
          <div
            css={`
              margin: ${2 * GU}px 0;
              color: ${theme.surfaceContentSecondary};
            `}
          >
            {activity ? (
              <LatestActivity
                activity={activity}
                tokenSymbol={symbol}
                distribution={distribution}
              />
            ) : (
              <span>No activity in the last 24h</span>
            )}
          </div>
          <div
            css={`
              display: grid;
              grid-template-columns: repeat(
                auto-fit,
                minmax(calc(50% - 8px), 1fr)
              );
              grid-column-gap: 8px;
            `}
          >
            {actions.map((action, index) => {
              return (
                <Button
                  key={index}
                  label={action.label}
                  mode={action.mode}
                  onClick={action.onClick}
                  wide
                  disabled={amount.eq(0)}
                />
              )
            })}
          </div>
        </animated.div>
      )}
    </div>
  )
})

const LatestActivity = ({ activity, distribution }) => {
  const theme = useTheme()
  const { anjToken } = useCourtConfig()
  const isIncoming = activity.direction === movementDirection.Incoming
  const displaySign =
    activity.direction === movementDirection.Incoming ||
    activity.direction === movementDirection.Outgoing

  let color = theme.contentSecondary
  // If sign shouldn't be displayed it means it's a Locked movement
  if (displaySign) color = isIncoming ? theme.positive : theme.negative

  return (
    <div
      css={`
        display: flex;
        justify-content: space-between;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
        `}
      >
        {!displaySign && (
          <img
            src={lockIcon}
            alt="lock"
            width="12px"
            height="14px"
            css={`
              margin-right: ${0.5 * GU}px;
            `}
          />
        )}
        <span
          css={`
            color: ${color};
            margin-right: ${0.5 * GU}px;
          `}
        >
          {formatTokenAmount(
            activity.amount,
            isIncoming,
            anjToken.decimals,
            displaySign
          )}{' '}
          {anjToken.symbol}
        </span>
        <span
          css={`
            color: ${theme.content};
          `}
        >
          {convertToString(activity.type, activity.direction)}
        </span>
      </div>
      {distribution && <HNYLockedHelp distribution={distribution} />}
    </div>
  )
}

const HNYLockedHelp = ({ distribution }) => {
  const theme = useTheme()

  const { showDistribution, text } = useHelpAttributes(distribution)

  let hintText = "What's my HNY distribution"
  if (!showDistribution) {
    hintText = distribution.inProcess.gt(0)
      ? 'Why is my HNY being deactivated'
      : 'Why is my balance locked'
  }

  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <span
        css={`
          color: ${theme.help};
          margin-right: ${0.5 * GU}px;
        `}
      >
        {showDistribution ? 'HNY Distribution ' : 'Why'}
      </span>
      <Help hint={hintText}>
        {showDistribution ? (
          <HNYLockedDistribution distribution={distribution} text={text} />
        ) : (
          text
        )}
      </Help>
    </div>
  )
}

function useHelpAttributes(distribution) {
  const { anjToken, minActiveBalance, penaltyPct } = useCourtConfig()

  return useMemo(() => {
    if (distribution.inProcess.gt(0)) {
      return {
        showDistribution: !!distribution.lockedPerDispute, // If juror has  HNY locked in disputes, we'll show distribution
        text:
          'Deactivating HNY does not happen immediately and requires one term before it can be processed.',
      }
    }

    const { lockedPerDispute } = distribution

    const onlyOneDispute = lockedPerDispute.length === 1
    const isJurorDraftedMultipleTimesSameDispute = lockedPerDispute.some(lock =>
      lock.weight.gt(1)
    )

    let text
    const { decimals, symbol } = anjToken
    const penaltyPercentage = bigNum(penaltyPct).div(PCT_BASE.div(100))
    const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
      digits: decimals,
    })
    const minLockedAmountFormatted = formatUnits(
      minActiveBalance.mul(penaltyPct).div(PCT_BASE),
      { digits: decimals }
    )

    if (isJurorDraftedMultipleTimesSameDispute) {
      text =
        'The same keeper can be drafted multiple times to answer the same dispute for the same round.  When that happens, their voting weight will be proportional to the number of times they are drafted, as well as the % of HNY locked in the Active balance.'
    } else {
      text = onlyOneDispute
        ? `A portion of your active HNY has been locked because you were drafted in a dispute. This amount will be locked until the dispute has been resolved. The exact locked amount corresponds to the ${penaltyPercentage}% of the minimum active balance for each time you get drafted. The minimum active balance is currently ${minActiveBalanceFormatted} ${symbol}, therefore the amount locked would be ${minLockedAmountFormatted} HNY.`
        : ''
    }

    return {
      text,
      showDistribution:
        !onlyOneDispute || isJurorDraftedMultipleTimesSameDispute,
    }
  }, [anjToken, distribution, minActiveBalance, penaltyPct])
}

export default Balance
