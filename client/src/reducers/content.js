import Immutable, { List } from 'immutable'
import * as actionTypes from '../actions/actionTypes'

const content = (state = new List(), action) => {
    if (action.type === actionTypes.GET_CONTENT || action.type == actionTypes.RELOAD_CONTENT) {
      return action.payload
    }
    return state
  }
  
  export {
    content
  }