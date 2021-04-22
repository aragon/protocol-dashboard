import React from 'react'
import {
  Button,
  ButtonIcon,
  GU,
  IconClose,
  textStyle,
  springs,
} from '@aragon/ui'
import { V1_COURT_ENDPOINT } from '../endpoints'
import { Transition, animated } from 'react-spring/renderprops'

function CloseButton({ compact, onClick }) {
  return (
    <div
      css={`
        position: absolute;
        top: ${2*GU}px;
        right: ${2*GU}px;

        ${compact && `
          top: ${GU}px;
          right: ${GU}px;
        `}
      `}
    >
      <ButtonIcon onClick={onClick} label="Close">
        <IconClose
          css={`
            color: #cd625c;
          `}
        />
      </ButtonIcon>
    </div>
  )
}

function RedirectMessage({ compact }) {
  return (
    <div css={`
      ${textStyle('body3')};
      color: #cd625c;
      display; flex;
      text-align: center;
      padding: ${GU}px

      ${compact && `
        padding: ${GU}px ${6 * GU}px
      `}
    `}>
      Court was migrated to Aragon v2 DAOS. Looking for the previous version of Court (for v1 DAOs)?
    </div>
  )
}

function RedirectButton({ compact }) {
  return (
    <div
      css={`
        padding: ${GU}px;
      `}
    >
      <Button
        mode="strong"
        label="Go to V1 Court"
        href={V1_COURT_ENDPOINT}
      />
    </div>
  )
}

function RedirectBanner ({ compactMode, onClose }) {

  return (
    <div css={`
      background: #fff5f1;
      display: flex;
      padding: ${GU}px
    `}>
      <div
        css={`
        display: flex;
        flex-grow: 1;
        flex-flow: column wrap;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        ${compactMode &&
          `
            flex-direction: column;
            align-items: space-between;
            justify-content: center;
          `}
        `}
      >
        <RedirectMessage compact={compactMode}/>
        <RedirectButton />
      </div>
      <CloseButton compactMode={compactMode} onClick={onClose}/>
    </div>
  )
}


function AnimatedRedirectBanner({ compactMode, onClose, show }) {

  return (
    <Transition
      items={show}
      from={{ opacity: 0 }}
      enter={{ opacity: 1, height: 'auto' }}
      leave={{ opacity: 0, height: 0 }}
      config={springs.smooth}
    >
      {show =>
        show &&
        (( props ) => (
          <animated.div style={props}>
            <RedirectBanner compactMode={compactMode} onClose={onClose}/>
          </animated.div>
        ))
      }
    </Transition>
  )
}

export default React.memo(AnimatedRedirectBanner)
