import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { BIG_RADIUS, GU, springs, useLayout, useTheme } from '@1hive/1hive-ui'
import { Transition, animated } from 'react-spring/renderprops'
import ToggleButton from './ToggleButton'
import OpenedSurfaceBorder from './OpenedSurfaceBorder'

function useSidePadding() {
  const { layoutName } = useLayout()
  return layoutName === 'small' ? 2 * GU : 3 * GU
}

const Accordion = React.memo(function Accordion({ items, round, ...props }) {
  const [opened, setOpened] = useState(-1)
  const toggleEntry = useCallback(index => {
    setOpened(opened => (opened === index ? -1 : index))
  }, [])

  return (
    <div {...props}>
      {items.map((entry, index) => (
        <Entry
          key={index}
          index={index}
          entry={entry}
          onToggle={toggleEntry}
          opened={opened === index}
          rowHeight={8 * GU}
          round={round}
        />
      ))}
    </div>
  )
})

const Entry = React.memo(function Entry({
  entry,
  index,
  onToggle,
  opened,
  round,
  rowHeight,
}) {
  const sidePadding = useSidePadding()

  const handleToggle = useCallback(() => {
    onToggle(index)
  }, [index, onToggle])

  const cells = [entry[0]]
  const expansion = entry.length > 1 ? [entry[1]] : null
  if (expansion) {
    cells.unshift(<Toggle opened={opened} onToggle={handleToggle} />)
  }

  return (
    <div
      css={`
        position: relative;
      `}
    >
      <Item
        cells={cells}
        firstRow={index === 0}
        opened={opened}
        rowHeight={rowHeight}
        sidePadding={sidePadding}
        round={round}
      />
      {expansion && (
        <EntryExpansion
          cellsCount={cells.length}
          expansion={expansion}
          opened={opened}
          rowHeight={rowHeight}
          sidePadding={sidePadding}
          round={round}
        />
      )}
      <OpenedSurfaceBorder opened={opened} round={round} />
    </div>
  )
})

function Item({ cells, opened, round, rowHeight, sidePadding }) {
  const theme = useTheme()

  return (
    <div
      css={`
        border-top-right-radius: ${BIG_RADIUS}px;
        ${round && opened && `border-right: 1px solid ${theme.border}`};
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          background: ${theme.surface};
          position: relative;
          z-index: 2;

          ${round
            ? `box-shadow: 0px 1px 3px rgb(0, 0, 0, 0.15);
               border-radius: ${BIG_RADIUS}px;
            `
            : `
            border: 1px solid ${theme.border}
          `}
        `}
      >
        {cells.map((content, index) => {
          // const first = index === 0
          return (
            <div
              key={index}
              css={`
                position: relative;
                height: ${rowHeight}px;
                padding: 0px ${sidePadding}px;
                display: flex;
                align-items: center;

                transition: border-width 0.1s ease;
              `}
            >
              <div
                css={`
                  display: flex;
                  width: 100%;
                  justify-content: ${`flex-end`};
                `}
              >
                {content}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EntryExpansion({ expansion, opened, round }) {
  const theme = useTheme()

  // Handles the height of the expansion in free layout mode
  const [freeLayoutContentHeight, setFreeLayoutContentHeight] = useState(0)

  const handleFreeLayoutContentRef = useCallback(element => {
    if (element) {
      setFreeLayoutContentHeight(element.getBoundingClientRect().height)
    }
  }, [])

  const height = freeLayoutContentHeight

  return (
    <Transition
      native
      unique
      items={opened}
      from={{ height: 0 }}
      enter={{ height }}
      update={{ height }}
      leave={{ height: 0 }}
      config={{ ...springs.smooth, precision: 0.1 }}
    >
      {show =>
        show &&
        (({ height }) => (
          <div
            css={`
              position: relative;
              padding: 0;
              background: ${theme.surfaceUnder};
              border: 1px solid ${theme.border};
              border-top: 0px;

              ${round &&
                `
                border-bottom-left-radius: 16px;
                border-bottom-right-radius: 16px;
              `}
            `}
          >
            {/* // // ${opened && `border-left: 3px solid ${theme.surfaceOpened}`};
            // // transition: border-width 0.1s ease; */}
            <div>
              <animated.div css="overflow: hidden" style={{ height }}>
                {expansion.map((child, i) => (
                  <div
                    key={i}
                    ref={handleFreeLayoutContentRef}
                    css={`
                      display: flex;
                      align-items: center;
                      height: auto;
                      padding-left: ${3 * GU}px;
                      padding-right: ${3 * GU}px;
                    `}
                  >
                    {child}
                  </div>
                ))}
              </animated.div>
            </div>
          </div>
        ))
      }
    </Transition>
  )
}

const Toggle = React.memo(function Toggle({ opened, onToggle }) {
  return (
    <div
      css={`
        width: 100%;
        height: 100%;
      `}
    >
      <ToggleButton opened={opened} onClick={onToggle} />
    </div>
  )
})

Accordion.propTypes = {
  items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
  round: PropTypes.bool,
}

Accordion.defaultProps = {
  round: true,
}

export default Accordion
