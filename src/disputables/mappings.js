// @ts-nocheck
// Disputable apps extractors
import environment from '../environment'
import {
  convictionVotingExtractor,
  dandelionVotingExtractor,
  delayExtractor,
  votingExtractor,
} from './scriptExtractors'
import {
  CONVICTION_VOTING_APP_IDS,
  DANDELION_VOTING_APP_IDS,
  DELAY_APP_IDS,
  VOTING_APP_IDS,
} from './known-appIds'

const disputableConvictionVotingAction = {
  entityPath: 'proposal',
  scriptExtractor: convictionVotingExtractor,
}
const disputableDandelionAction = {
  entityPath: 'vote',
  scriptExtractor: dandelionVotingExtractor,
}

const disputableDelayAction = {
  entityPath: 'delay',
  scriptExtractor: delayExtractor,
}
const disputableVotingAction = {
  entityPath: 'vote',
  scriptExtractor: votingExtractor,
}

const SUBGRAPH_API_KEY = environment('SUBGRAPH_API_KEY')

// Mapping of all disputable apps appId to their
// corresponding method for describing a disputed action.
export const DISPUTABLE_ACTIONS = new Map([
  ...DANDELION_VOTING_APP_IDS.map(appId => [appId, disputableDandelionAction]),
  ...DELAY_APP_IDS.map(appId => [appId, disputableDelayAction]),
  ...VOTING_APP_IDS.map(appId => [appId, disputableVotingAction]),
  ...CONVICTION_VOTING_APP_IDS.map(appId => [
    appId,
    disputableConvictionVotingAction,
  ]),
])

// Mapping of all disputable apps appId to their
// corresponding subgraph urls by network
export const DISPUTABLE_SUBGRAPH_URLS = new Map([
  ...VOTING_APP_IDS.map(appId => [
    appId,
    {
      xdai: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/QmST8VZnjHrwhrW5gTyaiWJDhVcx6TooRv85B49zG7ziLH`,
      rinkeby: 'https://api.thegraph.com/subgraphs/name/1hive/gardens-rinkeby',
    },
  ]),
  ...CONVICTION_VOTING_APP_IDS.map(appId => [
    appId,
    {
      xdai: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/QmST8VZnjHrwhrW5gTyaiWJDhVcx6TooRv85B49zG7ziLH`,
      rinkeby: 'https://api.thegraph.com/subgraphs/name/1hive/gardens-rinkeby',
    },
  ]),
])
