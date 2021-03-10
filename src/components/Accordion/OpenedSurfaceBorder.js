import React from 'react'
import PropTypes from 'prop-types'
import { Spring, animated } from 'react-spring/renderprops'
import { BIG_RADIUS, springs } from '@1hive/1hive-ui'

function OpenedSurfaceBorder({ opened, round, ...props }) {
  return (
    <Spring
      native
      from={{ width: 0 }}
      to={{ width: Number(opened) }}
      config={{ ...springs.smooth }}
    >
      {({ width }) => (
        <div
          css={`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;

            ${round && `border-radius: ${BIG_RADIUS}px`};
          `}
        >
          <animated.div
            css={`
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 3px;
              background: linear-gradient(
                16deg,
                #dc6b8c 33.42%,
                #8e54a5 51.57%
              );
              transform-origin: 0 0;
              z-index: 3;
            `}
            style={{
              transform: width.interpolate(v => `scale3d(${v}, 1, 1)`),
            }}
            {...props}
          />
        </div>
      )}
    </Spring>
  )
}

OpenedSurfaceBorder.propTypes = {
  opened: PropTypes.bool,
}

export default OpenedSurfaceBorder
