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
        top: ${2 * GU}px;
        right: ${2 * GU}px;
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

function RedirectMessage() {
  return (
    <div css={`
      ${textStyle('body3')};
      color: #cd625c;
      text-align: center;
      padding-bottom: ${2 * GU}px;
      width: ${90 * GU}px;
    `}>
      Court was migrated to Aragon Govern DAOs. Looking for the previous version of Court (with ANJ staked)?
    </div>
  )
}

function RedirectButton() {
  return (
    <div css={`
      padding-bottom: ${2 * GU}px;
    `}>
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
      padding-top: ${2 * GU}px
    `}>
      <div
        css={`
          display: flex;
          flex-flow: row wrap;
          align-items: center;
          justify-content: center;
          align-content: center;
          padding: 0 ${7 * GU}px;
        `}
      >
        <RedirectMessage />
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
