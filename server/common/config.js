const port = 3000
const host = '192.168.1.103'

// makes an object of the form {userJoined: 'userJoined'}
const messageTypes = [
  'messageAdded',
  'userRefreshed',
  'updateMask',
  'reloadContent',
  'resetMask',
  'enterRoom',
  'joinRequested',
  'clickWrongBox'
].reduce((accum, msg) => {
  accum[ msg ] = msg
  return accum
}, {})

const GET_MATRIX_CONTENT = 'GET_MATRIC_CONTENT'

const DIRECTOR = 'director'
const PLAYER = 'player'
const RED = 'red'
const GREEN = 'green'
const YELLOW = 'yellow'

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
  RED,
  GREEN,
  YELLOW,
  uri: `http://${host}:${port}`
}
