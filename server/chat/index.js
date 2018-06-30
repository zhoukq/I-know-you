const uuid = require('uuid')
const config = require('../common/config')
const logger = require('../logger')
const app = require('../app')
const { messageTypes, playerMask } = config

const {
  joinRequested,
  updateMask,
  reloadContent,
  resetMask,
  enterRoom
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

const onResetMask = ({ io, socket, data, maskMap }) => {
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

//there is a bug here, one user may have several browser page
//every page has a room, but they share same socket
//so the room will be override
const onEnterRoom = ({ io, socket, data, maskMap }) => {
  const event = enterRoom
  const { room, role } = data
  const user = { 'room': room, 'role': role }
  socket.user = user
  socket.request.session.user = user
  socket.request.session.save() // we have to do this explicitly

  logger.info({ playerMask, event })
  return io.sockets.emit(enterRoom, {
    'room': room,
    'role': role
  })
}

const onJoinRequested = ({ io, socket, maskMap, contentMap }) => {
  const event = joinRequested
  const user = socket.user
  
  if (user && user.room && user.role && maskMap.has(user.room.toString()) && contentMap.has(user.room.toString())) {
    return io.sockets.emit(joinRequested, {
      'room': user.room,
      'role': user.role,
      'content': contentMap.get(user.room.toString()),
      'mask': maskMap.get(user.room.toString()).mask,
      'joined': true
    })
  }
  return io.sockets.emit(joinRequested, { 'joined': false })
}

const onDisconnect = ({ io, socket }) => {
  const user = socket.user
  if (!user) {
    return
  }

  // this disconnect might be a refresh, give it a moment to make sure the user isn't coming back
  // disconnectedUsers[user.id] = setTimeout(() => {
  //   delete disconnectedUsers[user.id]
  //   logger.info({ event: userLeft, user })
  //   io.sockets.emit(userLeft, { userId: user.id })
  //   return sendSystemMessage({ io, message: `${user.name} left` })
  // }, 2000)
}

const handleReconnect = ({ io, socket, user, maskMap, contentMap }) => {
  logger.info({ user }, 'User refreshed')

  return onJoinRequested({io, socket, maskMap, contentMap})
}

const addListenersToSocket = ({ io, socket, maskMap, contentMap, getContent }) => {
  const user = socket.user
  
  //add reconnect event here
  //replace user with room number
  //we need add new action here, when user enter a room number,we need socket to 
  if (user) {
    handleReconnect({ io, socket, user, maskMap, contentMap })
  }

  socket.on(updateMask, (data) => onUpdateMask({ io, socket, data, maskMap }))
  socket.on(reloadContent, (data) => onReloadContent({ io, socket, data, maskMap, contentMap, getContent }))
  socket.on(resetMask, (data) => onResetMask({ io, socket, data, maskMap }))
  socket.on(enterRoom, (data) => onEnterRoom({ io, socket, data }))
  socket.on(joinRequested, (data) => onJoinRequested({ io, socket, maskMap, contentMap }))
  socket.on('disconnect', () => onDisconnect({ io, socket }))
}

module.exports.init = (io, maskMap, contentMap, getContent) => {
  io.on('connection', (socket) => addListenersToSocket({ io, socket, maskMap, contentMap, getContent }))
}
