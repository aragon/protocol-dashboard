import React, {useEffect} from 'react'
import { Redirect, Switch, useLocation } from 'react-router-dom'
import { trackPage } from '../src/services/analytics';

import Dashboard from './components/Dashboard/Dashboard'
import Tasks from './components/Tasks/Tasks'
import Disputes from './components/Disputes/Disputes'
import DisputeDetail from './components/Disputes/DisputeDetail'
import { ApmRoute } from '@elastic/apm-rum-react';

// Preferences
const GLOBAL_PREFERENCES_QUERY_PARAM = '?preferences=/'

export default function Routes() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPage(pathname);
  }, [pathname]);
  
  return (
    <Switch>
      <Redirect exact from="/" to="/dashboard" />
      <ApmRoute path="/dashboard" component={Dashboard} />
      <ApmRoute exact path="/tasks" component={Tasks} />
      <ApmRoute exact path="/disputes" component={Disputes} />
      <ApmRoute exact path="/disputes/:id" component={DisputeDetail} />
      <Redirect to="/dashboard" />
    </Switch>
  )
}

export function getPreferencesSearch(screen) {
  return `${GLOBAL_PREFERENCES_QUERY_PARAM}${screen}`
}
