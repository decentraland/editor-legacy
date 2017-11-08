const path = require('path')
const express = require('express')
const webpack = require('webpack')
const bodyParser = require('body-parser')
const proxy = require('express-http-proxy')
const assert = require('assert')
const Scene = require('./server/scene')
const webpackConfig = require('./webpack.config')
const compiler = webpack(webpackConfig)
const { search, download } = require('./server/google-poly')

const app = express()
const indexPath = path.join(__dirname, 'public', 'index.html')
const landingPath = path.join(__dirname, 'public', 'landing.html')

if (process.env.NODE_ENV !== 'production') {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }))
}

app.use('/api', proxy('localhost:3000', {
  proxyReqPathResolver: (req) => {
    return '/api' + require('url').parse(req.url).path
  }
}))

const port = (process.env.PORT || 4040)

const sse = function (req, res, next) {
  res.sseSetup = () => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': '',
      'X-Accel-Buffering': 'no'
    })
  }

  res.sseSend = (data) => {
    res.write('data: ' + JSON.stringify(data) + '\n\n')
  }

  next()
}

app.use(sse)
app.use(bodyParser.json())
app.get('/', function (_, res) { res.sendFile(landingPath) })
app.use(express.static(path.join(__dirname, 'public')))
app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.get('/scene/:name', function (_, res) { res.sendFile(indexPath) })

app.listen(port)

app.get('/model/search', function (req, res) {
  const query = req.query.q

  search(query)
    .then((results) => res.json(results))
})

app.get('/model/get-url', function (req, res) {
  const id = req.query.id

  download(id)
    .then((url) => res.json({url}))
})

// All the scenes we are acting as a signalhub for
var scenes = {}

// Get scene from object or create it, indexed by name
function getOrCreateScene (name) {
  assert(typeof name === 'string')

  if (scenes[name]) {
    return scenes[name]
  } else {
    const scene = new Scene(name)
    scenes[name] = scene
    return scene
  }
}

// Announce that I am using the inspector and am available to connect to
app.post('/scene/:name/announce', (req, res) => {
  const scene = getOrCreateScene(req.params.name)
  const uuid = req.body.uuid

  const packet = {
    type: 'announce',
    position: req.body.position,
    uuid: uuid
  }

  scene.connections.forEach((c) => {
    // Don't announce to self
    if (c.uuid !== uuid) {
      c.res.sseSend(packet)
    }
  })

  res.sendStatus(200)
})

// Send signalling data to another user
app.post('/scene/:name/:uuid/signal', (req, res) => {
  const scene = getOrCreateScene(req.params.name)
  const uuid = req.params.uuid

  const packet = {
    type: 'signal',
    initiator: req.body.initiator,
    data: req.body.data,
    uuid: req.body.uuid
  }

  // Return 200 if the other client is listening, 404
  // if the other client doesn't exist
  var result = false

  scene.connections.forEach((c) => {
    if (c.uuid === uuid) {
      c.res.sseSend(packet)
      result = true
    }
  })

  res.sendStatus(result ? 200 : 404)
})

// SSE connection listening for signalling and announce data
app.get('/scene/:name/:uuid/listen', (req, res) => {
  const scene = getOrCreateScene(req.params.name)

  res.sseSetup()

  // Send an accept message
  res.sseSend({
    type: 'accept'
  })

  // Send a ping to keep the connection alive
  const keepAlive = setInterval(() => {
    res.sseSend({
      type: 'ping'
    })
  }, 5000)

  // Create a connection object that we can add and remove from the scene
  const connection = {
    uuid: req.params.uuid,
    res: res
  }

  // Add conncetion
  scene.add(connection)

  // On the stream being closed we remove from the client
  res.on('close', () => {
    scene.remove(connection)
    clearInterval(keepAlive)
  })
})

console.log(`Listening at http://localhost:${port}`)
