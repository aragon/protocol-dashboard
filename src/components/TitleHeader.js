import React from 'react'
import { Button, GU, Header, useLayout } from '@1hive/1hive-ui'
import BuyHNY from './BuyHNY'

function TitleHeader({ title, onlyTitle = false }) {
  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'

  return (
    <Header
      primary={title}
      secondary={
        !onlyTitle && (
          <div
            css={`
              display: flex;
              align-items: center;
            `}
          >
            {!compactMode && (
              <Button
                label="User guide"
                href="https://1hive.gitbook.io/celeste/"
                css={`
                  margin-right: ${1.5 * GU}px;
                  width: 150px;
                `}
              />
            )}
            <BuyHNY
              css={`
                width: 150px;
              `}
            />
          </div>
        )
      }
    />
  )
}

export default TitleHeader
