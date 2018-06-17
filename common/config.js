const port = 3000
const host = '192.168.1.103'

// makes an object of the form {userJoined: 'userJoined'}
const messageTypes = [
  'messageAdded',
  'userRefreshed',
  'updateMask'
].reduce((accum, msg) => {
  accum[ msg ] = msg
  return accum
}, {})

const GET_MATRIX_CONTENT = 'GET_MATRIC_CONTENT'

const DIRECTOR = 'director'
const PLAYER = 'player'

const playerMask = [
  true,true,true,true,true,
  true,true,true,true,true,
  true,true,true,true,true,
  true,true,true,true,true,
  true,true,true,true,true
]

const directorMask = [
  false,false,false,false,false,
  false,false,false,false,false,
  false,false,false,false,false,
  false,false,false,false,false,
  false,false,false,false,false
]


module.exports = {
  port,
  host,
  messageTypes,
  playerMask,
  directorMask,
  DIRECTOR,
  PLAYER,
  uri: `http://${host}:${port}`
}