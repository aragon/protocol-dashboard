import React from 'react'
import { Button, GU, Header, useLayout } from '@1hive/1hive-ui'
import HNYIcon from '../assets/IconHNY.svg'

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
                href="https://help.aragon.org/article/41-aragon-court"
                css={`
                  margin-right: ${1.5 * GU}px;
                  width: 150px;
                `}
              />
            )}
            <Button
              icon={
                <div
                  css={`
                    display: flex;
                    height: ${GU * 3}px;
                    width: ${GU * 3}px;
                    margin-right: ${compactMode ? 0 : -6}px;
                  `}
                >
                  <img
                    src={HNYIcon}
                    css={`
                      margin: auto;
                    `}
                    height="16"
                    width="16"
                  />
                </div>
              }
              label="Buy HNY"
              mode="strong"
              display={compactMode ? 'icon' : 'label'}
              href="https://honeyswap.org/#/swap?inputCurrency=0xe91d153e0b41518a2ce8dd3d7944fa863463a97d&outputCurrency=0x71850b7e9ee3f13ab46d67167341e4bdc905eef9"
              target="_blank"
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
