import React, { useMemo } from 'react'
import { Button, GU, Help, textStyle, useTheme } from '@aragon/ui'
import { animated, useSpring } from 'react-spring'

import Loading from '../Loading'
import ANTLockedDistribution from './ANTLockedDistribution'
import SplitAmount from '../SplitAmount'

import { useCourtConfig } from '../../providers/CourtConfig'
import { useTokenAmountToUsd } from '../../hooks/useTokenAmountToUsd'

import { PCT_BASE } from '../../utils/dispute-utils'
import { bigNum, formatTokenAmount, formatUnits } from '../../lib/math-utils'
import { movementDirection, convertToString } from '../../types/ant-types'

import ANTIcon from '../../assets/IconANT.svg'
import lockIcon from '../../assets/IconLock.svg'

const Balance = React.memo(function Balance({
  actions,
  activity,
  amount,
  distribution,
  label,
  loading,
  mainIcon,
}) {
  const theme = useTheme()

  const { token: antToken } = useCourtConfig()
  const { symbol, decimals } = antToken

  const convertedAmount = useTokenAmountToUsd(antToken, amount)

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
            <div
              css={`
                margin-right: ${2 * GU}px;
              `}
            >
              <img
                css={`
                  display: block;
                `}
                src={mainIcon}
                height={6 * GU}
                width={6 * GU}
              />
            </div>
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
                <img height="14" width="14" src={ANTIcon} alt="ANT" />
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
  const { token: antToken } = useCourtConfig()
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
            antToken.decimals,
            displaySign
          )}{' '}
          {antToken.symbol}
        </span>
        <span
          css={`
            color: ${theme.content};
          `}
        >
          {convertToString(activity.type, activity.direction)}
        </span>
      </div>
      {distribution && <ANTLockedHelp distribution={distribution} />}
    </div>
  )
}

const ANTLockedHelp = ({ distribution }) => {
  const theme = useTheme()

  const { showDistribution, text } = useHelpAttributes(distribution)

  let hintText = "What's my ANT distribution"
  if (!showDistribution) {
    hintText = distribution.inProcess.gt(0)
      ? 'Why is my ANT being deactivated'
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
        {showDistribution ? 'ANT Distribution ' : 'Why'}
      </span>
      <Help hint={hintText}>
        {showDistribution ? (
          <ANTLockedDistribution distribution={distribution} text={text} />
        ) : (
          text
        )}
      </Help>
    </div>
  )
}

function useHelpAttributes(distribution) {
  const { minActiveBalance, penaltyPct, token: antToken } = useCourtConfig()

  return useMemo(() => {
    if (distribution.inProcess.gt(0)) {
      return {
        showDistribution: !!distribution.lockedPerDispute, // If guardian has ANT locked in disputes, we'll show distribution
        text:
          'Deactivating ANT does not happen immediately and requires one term before it can be processed.',
      }
    }

    const { lockedPerDispute } = distribution

    const onlyOneDispute = lockedPerDispute.length === 1
    const isGuardianDraftedMultipleTimesSameDispute = lockedPerDispute.some(lock =>
      lock.weight.gt(1)
    )

    let text
    const { decimals, symbol } = antToken
    const penaltyPercentage = bigNum(penaltyPct).div(PCT_BASE.div(100))
    const minActiveBalanceFormatted = formatUnits(minActiveBalance, {
      digits: decimals,
    })
    const minLockedAmountFormatted = formatUnits(
      minActiveBalance.mul(penaltyPct).div(PCT_BASE),
      { digits: decimals }
    )

    if (isGuardianDraftedMultipleTimesSameDispute) {
      text =
        'The same guardian can be summoned multiple times to arbitrate the same dispute for the same round.  When that happens, their voting weight will be proportional to the number of times they are summoned, as well as the % of ANT locked in the Active balance.'
    } else {
      text = onlyOneDispute
        ? `A portion of your active ANT has been locked because you were summoned in a dispute. This amount will be locked until the dispute has been resolved. The exact locked amount corresponds to the ${penaltyPercentage}% of the minimum active balance for each time you get summoned. The minimum active balance is currently ${minActiveBalanceFormatted} ${symbol}, therefore the amount locked would be ${minLockedAmountFormatted} ANT.`
        : ''
    }

    return {
      text,
      showDistribution:
        !onlyOneDispute || isGuardianDraftedMultipleTimesSameDispute,
    }
  }, [antToken, distribution, minActiveBalance, penaltyPct])
}

export default Balance
