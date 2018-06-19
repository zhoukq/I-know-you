import * as actionTypes from '../actions/actionTypes'
import { playerMask, directorMask } from '../../../common/config'
import * as config from '../../../common/config'
const { messageTypes, DIRECTOR, PLAYER } = config
import Immutable, { List } from 'immutable'

const userConfig = (state, action) => {
    if (action.type === actionTypes.SET_ROLE) {
        return action.payload === DIRECTOR ? {
            role: action.payload,
            mask: Immutable.fromJS(directorMask),
            room: state.room
        } : {
                role: action.payload,
                mask: Immutable.fromJS(playerMask),
                room: state.room
            }
    }
    if (action.type == messageTypes.updateMask) {
        if (action.payload.room == state.room) {
            return {
                role: state.role,
                mask: Immutable.fromJS(action.payload.mask),
                room: state.room
            }
        }
    }
    if (action.type === actionTypes.ADD_ROOM) {
        return {
            role: state.role,
            mask: state.mask,
            room: action.payload
        }
    }
    if(action.type == actionTypes.GET_MASK){
        return {
            role: state.role,
            mask: Immutable.fromJS(action.payload.mask),
            room: state.room
        }
    }
    if(action.type == actionTypes.RESET_MASK){
        return {
            role: state.role,
            mask: Immutable.fromJS(action.payload.mask),
            room: state.room
        }
    }
    return state
}


export {
    userConfig
}