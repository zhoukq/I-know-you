const uuid = require('uuid')
const config = require('../../common/config')
const logger = require('../logger')
const app = require('../app')
const { messageTypes,playerMask } = config

const {
  updateMask,
  reloadContent,
  resetMask
} = messageTypes

const onUpdateMask = ({ io, socket, data, maskMap }) => {
  const event = updateMask
  const { user } = socket
  let { mask, room } = data
  if (maskMap.has(room.toString())) {
    mask = maskMap.get(room.toString()).mask.map((v, index) => v && mask[index])
  }
  maskMap.set(room.toString(), { 'mask': mask })
  logger.info({ mask, event, user })
  return io.sockets.emit(updateMask, {
    'mask': mask,
    'room': room
  })
}

const onReloadContent = ({ io, socket, data, contentMap, getContent }) => {
  const event = reloadContent
  const { user } = socket
  let { room } = data

  const content = getContent()
  contentMap.set(room.toString(), content)

  logger.info({ content, event, user })
  return io.sockets.emit(reloadContent, {
    'content': content,
    'room': room
  })
}

const onResetMask = ({ io, socket, data, maskMap }) =>{
  const event = resetMask
  const { user } = socket
  let { room } = data

  maskMap.set(room.toString(), { 'mask': playerMask })

  logger.info({ playerMask, event, user })
  return io.sockets.emit(resetMask, {
    'mask': playerMask,
    'room': room
  })
}

// userId -> timerId, for clearing pending userLeft messages on refresh (which is a quick disconnect / reconnect)
const disconnectedUsers = {}

const onDisconnect = ({ io, socket }) => {
  const user = socket.user
  if (!user) {
    return
  }

  // this disconnect might be a refresh, give it a moment to make sure the user isn't coming back
  disconnectedUsers[user.id] = setTimeout(() => {
    delete disconnectedUsers[user.id]
    logger.info({ event: userLeft, user })
    io.sockets.emit(userLeft, { userId: user.id })
    return sendSystemMessage({ io, message: `${user.name} left` })
  }, 2000)
}

const handleReconnect = ({ socket, user }) => {
  const timeoutId = disconnectedUsers[user.id]

  if (timeoutId) {
    clearTimeout(timeoutId)
    logger.info({ user }, 'User refreshed')
    return socket.emit(joinRequested, user)
  }

  return addUser({ socket, user })
}

const addListenersToSocket = ({ io, socket, maskMap, contentMap, getContent }) => {
  const user = socket.user
  if (user) {
    handleReconnect({ socket, user })
  }

  socket.on(updateMask, (data) => onUpdateMask({ io, socket, data, maskMap }))
  socket.on(reloadContent, (data) => onReloadContent({ io, socket, data, maskMap, contentMap, getContent }))
  socket.on(resetMask,(data) => onResetMask({ io, socket, data, maskMap }))
  socket.on('disconnect', () => onDisconnect({ io, socket }))
}

module.exports.init = (io, maskMap, contentMap, getContent) => {
  io.on('connection', (socket) => addListenersToSocket({ io, socket, maskMap, contentMap, getContent }))
}
