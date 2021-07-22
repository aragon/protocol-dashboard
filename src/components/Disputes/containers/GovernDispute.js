import React, { useCallback, useMemo }  from 'react'
import { GU, textStyle, Info, DataView } from '@aragon/ui'

import { useIpfsFetch } from '../../../hooks/ipfs-hooks';
import Field from '../DisputeField';
import useActionDataDecoder from '../../../hooks/useActionDataDecoder'
import Loading from '../../Loading'
import styled from 'styled-components'

// this is a hack until we fix the issue with DataView
// not showing the full content on expansion
const DataViewWrapper = styled.div`
  div[class*="TableView___StyledAnimatedDiv2"] {
    height: auto !important;
  }
`

const FieldLabel = styled.div`
  ${({ theme }) => `
    ${textStyle('label2')};
    color: ${theme.surfaceContentSecondary};
  `}
`

const ActionContent = React.memo(function ActionContent({to, value, data}) {
    const { decoding, decodedData } = useActionDataDecoder(to, data)
  
    const marginCss = `margin: ${2 * GU}px 0`;
    return (
      <div>
        <Field
          css={marginCss}
          label="To"
          value={to}
        />
        <Field
          css={marginCss}
          label="Value"
          value={value.toString()}
        />
        {
          decoding && <Loading size="small" />
        }
        {
          !decoding && decodedData &&
          <div>
            <Field
              css={marginCss}
              label="Function to be called"
              value={decodedData.functionName}
            />
            <div css={marginCss}>
              <FieldLabel>Data</FieldLabel>
              <div>
                <pre>
                  {JSON.stringify(decodedData.inputData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        }
        {
          !decoding && !decodedData &&
          <div>
            <FieldLabel>Raw Data</FieldLabel>
            <Info mode="warning">
              Unable to decode data because contract is not verified on etherscan
            </Info>
            <Field
              css={`
                ${marginCss}
                word-break: break-word;
                overflow-wrap: anywhere;
              `}
              value={data}
            />
          </div>
        }
      </div>
    )
})

const ActionAccordion = React.memo(function ActionAccordion({action, index}) {
    const fields = useMemo(() => [null], []);
    const renderEntry = useCallback(([entryIndex]) => ([<div>Action # {entryIndex+1}</div>]), []); 
    const renderEntryExpansion = useCallback(
      ([_, to, value, data]) => {
        return (<ActionContent to={to} value={value} data={data}/>);
      }, [] // eslint-disable-line react-hooks/exhaustive-deps
    )
  
    const entries = useMemo(() => 
        [[index, action.to, action.value, action.data]], 
        [] // eslint-disable-line react-hooks/exhaustive-deps 
    );
  
    return (
      <DataViewWrapper>
        <DataView
          fields={fields}
          entries={entries}
          renderEntry={renderEntry}
          renderEntryExpansion={renderEntryExpansion}
        />
      </DataViewWrapper>
    )
  });

function GovernDisputedData({dispute}) {
    const { config, payload } = dispute.metadata

    const proof =  useIpfsFetch(payload.proof) 
    const rules =  useIpfsFetch(config.rules) 

    return (  
        <div>
            <Field
                label="Description"
                value={proof?.metadata?.title}
                loading={!proof}
                css={`
                word-break: break-word;
                overflow-wrap: anywhere;
                `} 
            />
            <Field
                label="DAO agreement"
                value={rules?.text || rules}
                endpoint={rules?.endpoint}
                loading={!rules}
                css={`
                word-break: break-word;
                overflow-wrap: anywhere;
                `} 
            />
            <Field
                label="Executor"
                value={payload.executor}
            />
            {/* <Field
                label="Allow Failures Map"
                value={payload.allowFailuresMap}
                isUTF8={false}
                css={`
                word-break: break-word;
                overflow-wrap: anywhere;
                `}
            /> */}
            
            <h1
                css={`
                padding-top: ${2 * GU}px;
                ${textStyle('body1')};
                font-weight: 600;
                `}
            >Actions</h1>
            <hr />
            {payload.actions.map( (action, index)=> {
                return (
                    <ActionAccordion
                    key={index}
                    action={action}
                    index={index}
                    />
                )
            })}
        </div>
    )
    
}

export default GovernDisputedData;
