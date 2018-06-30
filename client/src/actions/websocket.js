import io from 'socket.io-client'
import { messageTypes } from '../common/config'
const socket = io(window.location.href)

const init = (store) => {
  // add listeners to socket messages so we can re-dispatch them as actions
  Object.keys(messageTypes)
    .forEach(type => socket.on(type, (payload) => store.dispatch({ type, payload })))
}

const emit = (type, payload) => socket.emit(type, payload)

export {
  init,
  emit
}
