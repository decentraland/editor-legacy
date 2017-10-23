const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const indexPath = path.join(__dirname, 'public', 'index.html')
const landingPath = path.join(__dirname, 'public', 'landing.html')

const port = (process.env.PORT || 4040)
var connections = []

const sse = function (req, res, next) {
  res.sseSetup = () => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
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

// Announce that I am using the inspector and am available to connect to
app.post('/announce', (req, res) => {
  const uuid = req.body.uuid

  const packet = {
    type: 'announce',
    position: req.body.position,
    uuid: uuid
  }

  connections.forEach((c) => {
    // Don't announce to self
    if (c.uuid !== uuid) {
      c.res.sseSend(packet)
    }
  })

  res.sendStatus(200)
})

// Send signalling data to another user
app.post('/:uuid/signal', (req, res) => {
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

  connections.forEach((c) => {
    if (c.uuid === uuid) {
      c.res.sseSend(packet)
      result = true
    }
  })

  res.sendStatus(result ? 200 : 404)
})

// SSE connection listening for signalling and announce data
app.get('/:uuid/listen', (req, res) => {
  res.sseSetup()

  res.sseSend({
    type: 'accept'
  })

  setInterval(() => {
    res.sseSend({
      type: 'ping'
    })
  }, 5000)

  connections.push({
    uuid: req.params.uuid,
    res: res
  })
})

console.log(`Listening at http://localhost:${port}`)
