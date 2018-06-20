import * as actionTypes from '../actions/actionTypes'
import { messageTypes, DIRECTOR, PLAYER, playerMask, directorMask } from '../../../common/config'
import Immutable, { List } from 'immutable'

const userConfig = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_ROLE:
            return action.payload === DIRECTOR ? {
                ...state,
                role: action.payload,
                mask: Immutable.fromJS(directorMask),
            } : {
                    role: action.payload,
                    mask: Immutable.fromJS(playerMask),
                    room: state.room
                }
        case messageTypes.updateMask:
            if (action.payload.room == state.room) {
                return {
                    ...state,
                    mask: Immutable.fromJS(action.payload.mask),
                }
            }
        case actionTypes.ADD_ROOM:
            return {
                ...state,
                room: action.payload
            }
        case actionTypes.GET_MASK:
            return {
                ...state,
                mask: Immutable.fromJS(action.payload.mask),
            }
        case messageTypes.resetMask:
            if (action.payload.room == state.room) {
                return {
                    ...state,
                    mask: Immutable.fromJS(action.payload.mask),
                }
            }
        case actionTypes.GET_CONTENT:
            if (action.payload.room == state.room) {
                return {
                    ...state,
                    content: action.payload.content
                }
            }
        case messageTypes.reloadContent:
            if (action.payload.room == state.room) {
                return {
                    ...state,
                    content: action.payload.content
                }
            }
    }

    return state
}


export {
    userConfig
}