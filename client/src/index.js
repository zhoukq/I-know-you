import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { List, Map } from 'immutable'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import App from './App'
import rootReducer from './reducers'
import { init as websocketInit, emit } from './actions/websocket'
import { playerMask, directorMask } from '../../common/config'
import './index.css'
import Immutable from 'immutable'

const initialState = new Map()
  .set('content', new List([
    { 'text': '1', 'team': 'useless' }, { 'text': '2', 'team': 'green' }, { 'text': '3', 'team': 'green' }, { 'text': '4', 'team': 'red' },
    { 'text': '5', 'team': 'red' }, { 'text': '6', 'team': 'green' }, { 'text': '7', 'team': 'green' }, { 'text': '8', 'team': 'red' },
    { 'text': '9', 'team': 'bomb' }, { 'text': '10', 'team': 'useless' }, { 'text': '11', 'team': 'green' }, { 'text': '12', 'team': 'red' },
    { 'text': '13', 'team': 'useless' }, { 'text': '14', 'team': 'green' }, { 'text': '15', 'team': 'green' }, { 'text': '16', 'team': 'green' },
    { 'text': '17', 'team': 'red' }, { 'text': '18', 'team': 'red' }, { 'text': '19', 'team': 'red' }, { 'text': '20', 'team': 'red' },
    { 'text': '21', 'team': 'useless' }, { 'text': '22', 'team': 'useless' }, { 'text': '23', 'team': 'useless' }, { 'text': '24', 'team': 'useless' },
    { 'text': '25', 'team': 'useless' },
  ]))
  .set('userConfig', { 'role': 'player', 'mask': Immutable.fromJS(playerMask), 'room': -1 })

function startUp() {
  const middleware = [thunkMiddleware.withExtraArgument({ emit })]
  // use the logger in development mode - this is set in webpack.config.dev.js
  if (__DEV__) {
    middleware.push(createLogger())
  }

  const store = createStore(rootReducer, initialState, applyMiddleware(...middleware))
  websocketInit(store) // setup websocket listeners etc

  return store
}

ReactDOM.render(
  <Provider store={startUp()}>
    <App />
  </Provider>,
  document.getElementById('root')
)
