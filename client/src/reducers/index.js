import { combineReducers } from 'redux-immutable'
import  { content } from './content'
import {userConfig} from './userConfig'

export default combineReducers({
  content,
  userConfig
})
