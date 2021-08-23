import React, {useEffect} from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { trackPage } from '../src/services/analytics';

import Dashboard from './components/Dashboard/Dashboard'
import Tasks from './components/Tasks/Tasks'
import Disputes from './components/Disputes/Disputes'
import DisputeDetail from './components/Disputes/DisputeDetail'

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
      <Route path="/dashboard" component={Dashboard} />
      <Route exact path="/tasks" component={Tasks} />
      <Route exact path="/disputes" component={Disputes} />
      <Route exact path="/disputes/:id" component={DisputeDetail} />
      <Redirect to="/dashboard" />
    </Switch>
  )
}

export function getPreferencesSearch(screen) {
  return `${GLOBAL_PREFERENCES_QUERY_PARAM}${screen}`
}
