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
  enterRoom,
  clickWrongBox
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
  return io.sockets.to(room.toString()).emit(updateMask, {
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
  return io.sockets.to(room.toString()).emit(reloadContent, {
    'content': content,
    'room': room,
    'operable':true
  })
}

const onResetMask = ({ io, socket, data, maskMap }) => {
  const event = resetMask
  const { user } = socket
  let { room } = data

  maskMap.set(room.toString(), { 'mask': playerMask })

  logger.info({ playerMask, event, user })
  return io.sockets.to(room.toString()).emit(resetMask, {
    'mask': playerMask,
    'room': room,
    'operable':true
  })
}

const onEnterRoom = ({ io, socket, data, maskMap }) => {
  const event = enterRoom
  const { room, role, team } = data
  const user = { 'room': room, 'role': role, 'team': team, 'operable': true }
  socket.user = user
  socket.request.session.user = user
  socket.request.session.save() // we have to do this explicitly

  socket.join(room.toString())
  logger.info({ user, event })
  return io.sockets.to(room.toString()).emit(enterRoom, {
    'room': room,
    'role': role,
    'team': team
  })
}

const onJoinRequested = ({ io, socket, maskMap, contentMap }) => {
  const event = joinRequested
  const user = socket.user
  logger.info({ user, event })
  if (user && user.room && user.role && maskMap.has(user.room.toString()) && contentMap.has(user.room.toString())) {
    socket.join(user.room.toString())
    return socket.emit(joinRequested, {
      'room': user.room,
      'role': user.role,
      'team': user.team,
      'content': contentMap.get(user.room.toString()),
      'mask': maskMap.get(user.room.toString()).mask,
      'joined': true,
      'operable': user.operable
    })
  }
  return socket.emit(joinRequested, { 'joined': false })
}

const onClickWrongBox = ({ io, socket, data }) => {
  const event = clickWrongBox
  const user = socket.user
  user.operable = false
  socket.request.session.user = user
  socket.request.session.save() // we have to do this explicitly

  const { room, team } = data
  logger.info({ room, team, event })
  if (user && user.room && room == user.room) {
    return io.sockets.to(room.toString()).emit(clickWrongBox, {
      'room': room,
      'team': team
    })
  }else{
    return socket.emit(joinRequested, { 'joined': false })
  }
  
}

const onDisconnect = ({ io, socket }) => {
  const user = socket.user
  if (!user) {
    return
  }
  socket.leave(user.room.toString())

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

  return onJoinRequested({ io, socket, maskMap, contentMap })
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
  socket.on(clickWrongBox, (data) => onClickWrongBox({ io, socket, data }))
  socket.on('disconnect', () => onDisconnect({ io, socket }))
}

module.exports.init = (io, maskMap, contentMap, getContent) => {
  io.on('connection', (socket) => addListenersToSocket({ io, socket, maskMap, contentMap, getContent }))
}
