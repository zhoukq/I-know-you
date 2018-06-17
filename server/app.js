const { createServer } = require('http')
const { ensureDir } = require('fs-extra')
const _ = require('lodash')
const express = require('express')
const socketIo = require('socket.io')
const helmet = require('helmet')
const session = require('express-session')
const LevelStore = require('level-session-store')(session)
const config = require('./config')
const { host, port } = require('../common/config')
const logger = require('./logger')
const chat = require('./chat')
const { DIRECTOR, PLAYER, playerMask, directorMask } = require('../common/config')

var fs = require('fs');

const contentMap = new Map()
const maskMap = new Map()

const setup = () => {
  const env = process.env.NODE_ENV || 'development'
  const app = express()
  const server = createServer(app)

  const io = socketIo(server, {})
  chat.init(io, maskMap)

  app.use(helmet())
  const sessionMiddleware = session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: env !== 'development' },
    // for larger, distributed, APIs use redis or something else instead
    store: new LevelStore(config.sessionStorePath)
  })
  app.use(sessionMiddleware)

  // copies express sessions to socket-io
  io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next))

  // saves having to type "socket.request.session.user" everywhere
  io.use((socket, next) => {
    const user = _.get(socket, 'request.session.user')
    if (user) {
      socket.user = user
    }
    return next()
  })

  // for serving the client
  app.use(express.static('public'))

  app.use((err, req, res, next) => {
    logger.error({ err })

    if (!res.headersSent) {
      res.status(500).send()
    }
  })

  app.get('/mask', function (req, res) {
    if (req.query.room != undefined) {
      const room = req.query.room
      if (maskMap.has(room)) {
        res.send(maskMap.get(room))
        return
      }
      const role = req.query.role
      if (role === DIRECTOR) {
        maskMap.set(room.toString(), { 'mask': directorMask })
        res.send(maskMap.get(room))
      }
      if (role === PLAYER) {
        maskMap.set(room.toString(), { 'mask': playerMask })
        res.send(maskMap.get(room))
      }
      return
    }
  })

  app.get('/content', function (req, res) {
    //generate team by role
    //example:
    // [
    //   {'text':'1', 'team':'red'}, {'text':'2', 'team':'green'},{'text':'3', 'team':'green'}, {'text':'4', 'team':'red'},
    //   {'text':'5', 'team':'red'}, {'text':'6', 'team':'green'},{'text':'7', 'team':'green'}, {'text':'8', 'team':'red'},
    //   {'text':'9', 'team':'red'}, {'text':'10', 'team':'useless'},{'text':'11', 'team':'green'}, {'text':'12', 'team':'red'},
    //   {'text':'13', 'team':'red'}, {'text':'14', 'team':'green'},{'text':'15', 'team':'green'}, {'text':'16', 'team':'red'}
    // ]

    //data example
    //a,b,c,d,e,f,g,h,i,j,k
    if (req.query.room != undefined) {
      const room = req.query.room
      if (contentMap.has(room)) {
        res.send(contentMap.get(room))
        return
      }
      const mask = ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red',
        'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green',
        'useless', 'useless', 'useless', 'useless', 'useless', 'useless', 'useless', 'useless',
        'bomb'].sort((a, b) => Math.random() > .5 ? -1 : 1)
      const data = fs.readFileSync('./resource.txt', 'utf8')
      const contentArray = data.split(',')
      const contentSet = new Set()
      while (contentSet.size < 25) {
        const num = Math.floor(Math.random() * (contentArray.length))
        contentSet.add(
          contentArray[num]
        )
      }
      responseContent = [...contentSet].map((target, index) => { return { 'text': target, 'team': mask[index] } })
      contentMap.set(room, responseContent)
      res.send(responseContent)
    }
  })

  return new Promise((resolve, reject) => {
    return server.listen(port, host, (err) => {
      if (err) {
        return reject(err)
      }
      logger.info(`Server listening on ${host}:${port}`)
      return resolve(server)
    })
  })
}



const onError = (err) => {
  logger.error(err)
  setTimeout(() => {
    process.exit(1)
  }, 1000) // given the logger time to write a logs
}

ensureDir(config.sessionStorePath)
  .then(setup)
  .catch(onError)

process.on('uncaughtException', onError)
