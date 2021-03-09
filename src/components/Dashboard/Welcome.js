import React from 'react'
import { Button, GU, textStyle } from '@1hive/1hive-ui'
import banner from '../../assets/Welcome.png'

function Welcome() {
  return (
    <div
      css={`
        background: url(${banner});
        background-size: cover;
        margin-bottom: ${2 * GU}px;
        border-radius: ${0.5 * GU}px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        flex-wrap: wrap;
        height: 280px;
      `}
    >
      <div
        css={`
          padding: ${4 * GU}px;
          width: 600px;
          color: white;
        `}
      >
        <h1
          css={`
            ${textStyle('title1')};
            font-weight: 200;
            margin-bottom: ${1 * GU}px;
          `}
        >
          Welcome to Celeste
        </h1>
        <p
          css={`
            ${textStyle('body1')}
            margin-bottom: ${3 * GU}px;
          `}
        >
          Celeste is a protocol that produces answers to disputes by
          incentivizing keepers to respond coherently.
        </p>
        <div
          css={`
            display: flex;
            align-items: center;
          `}
        >
          <Button
            label="Buy HNY"
            href="https://honeyswap.org/#/swap?inputCurrency=0xe91d153e0b41518a2ce8dd3d7944fa863463a97d&outputCurrency=0x71850b7e9ee3f13ab46d67167341e4bdc905eef9"
            mode="strong"
            css={`
              width: ${19 * GU}px;
              margin-right: ${1.5 * GU}px;
              background: linear-gradient(89deg, #6050b0 -42%, #8e54a5 117%);
            `}
          />
          <Button
            label="User guide"
            href="https://help.aragon.org/article/41-aragon-court"
            css={`
              width: ${19 * GU}px;
            `}
          />
        </div>
      </div>
    </div>
  )
}

export default Welcome
