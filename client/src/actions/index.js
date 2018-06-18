import * as config from '../../../common/config'
import * as actionTypes from '../actions/actionTypes'
import fetch from 'isomorphic-fetch'
const { messageTypes } = config

export function startUp() {
  // this is the redux-middleware package in action, dispatch and getState params are passed in
  return (dispatch, getState, { emit }) => {
    emit(messageTypes.usersRequested)
  }
}

export function updateMask(room, mask) {
  return (dispatch, getState, { emit }) => {
    emit(messageTypes.updateMask, { 'mask': mask, 'room': room })
  }
}

export function setRole(role) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.SET_ROLE, payload: role })
  }
}

export function addRoom(room) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.ADD_ROOM, payload: room })
  }
}

export function getContent(room) {
  return (dispatch) => {
    return fetch(`${config.uri}/content?room=${room}`)
      .then(response => response.json())
      .then(json => { dispatch({ type: actionTypes.GET_CONTENT, payload: json }) })
  }
}

export function getMask(room, role) {
  return (dispatch => {
    return fetch(`${config.uri}/mask?room=${room}&role=${role}`)
      .then(response => response.json())
      .then(json => { dispatch({ type: actionTypes.GET_MASK, payload: json }) })
  })
}

export function saveResource(data) {
  console.log(JSON.stringify({ content: data })
  return (dispatch => {
    return fetch(`${config.uri}/data`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: data })
    })
  })
}