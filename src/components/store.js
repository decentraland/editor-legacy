import { createStore, applyMiddleware, bindActionCreators, compose, combineReducers } from 'redux'
import * as reactRedux from 'react-redux'
import reduxThunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import * as actions from './actions'
//import * as handlers from './handlers'
import reducers from "./reducers"
import rootSaga from './sagas'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

/* function invokeHandler(state, action) {
  let handler = handlers[action.type]

  if (! state) return INITIAL_STATE
  if (! handler) throw new Error(`Unknown store action ${action.type}`)

  return handler(state, action)
} */

export function dispatch(action) {
  if (typeof action === 'string') {
    store.dispatch({ type: action })

  } else {
    store.dispatch(action)
  }
}

export function getState() {
  return store.getState()
}

export function connect(Component) {
  function mapStateToProps(state, ownProps) {
    const selectors = Component.getState(state, ownProps)

    return selectors
  }

  function mapDispatchToProps(dispatch) {
    if (! Component.getActions) return {}

    const actionCreators = Component.getActions(actions, dispatch)

    return {
      actions: bindActionCreators(actionCreators, dispatch)
    }
  }

  return reactRedux.connect(mapStateToProps, mapDispatchToProps)(Component)
}

const sagaMiddleware = createSagaMiddleware()
const middlewares = [];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger');

  const logger = createLogger({
    collapsed: true
  });

  middlewares.push(logger);
}

export const store = createStore(
  combineReducers(reducers),
  composeEnhancers(
    applyMiddleware(reduxThunk, sagaMiddleware, ...middlewares)
  )
)

sagaMiddleware.run(rootSaga)
