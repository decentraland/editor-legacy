/* globals fetch, EventSource */
import uuid from 'uuid/v4'
import Peer from 'simple-peer'
import EventEmitter from 'events'
import assert from 'assert'

export default class WebrtcClient extends EventEmitter {
  constructor (sceneName) {
    super()

    assert(typeof sceneName === 'string', 'sceneName not supplied')
    this.sceneName = sceneName

    this.uuid = uuid()
    this.peers = {}
    this.startedAt = this.getEpoch()
  }

  get endpoint () {
    return `/scene/${this.sceneName}`
  }

  getEpoch () {
    return new Date(new Date().toUTCString()).getTime()
  }

  connect () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.connectToEventSource()
      return
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.stream = stream
        this.connectToEventSource()
      })
      .catch(() => {
        // no stream supported
        this.connectToEventSource()
      })
  }

  connectToEventSource () {
    this.source = new EventSource(`${this.endpoint}/${this.uuid}/listen`)

    this.source.addEventListener('message', this.onMessage.bind(this), false)

    this.source.addEventListener('open', (e) => {
      this.sendAnnounce()
    }, false)

    this.source.addEventListener('error', (e) => {
      if (e.readyState === EventSource.CLOSED) {
        console.log('Connection was closed')
      }
    }, false)

    setInterval(() => {
      this.sendAnnounce()
    }, 5000)
  }

  get connected () {
    return this.source.readyState === EventSource.OPEN
  }

  get headers () {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  }

  sendAnnounce () {
    if (this.connected) {
      fetch(`${this.endpoint}/announce`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          uuid: this.uuid
        })
      })
    }
  }

  onMessage (e) {
    var packet

    try {
      packet = JSON.parse(e.data)
    } catch (e) {
      console.error(`bad packet: ${e.data}`)
    }

    if (packet.type === 'accept') {
      // ignore
    } else if (packet.type === 'ping') {
      // ignore
    } else if (packet.type === 'announce') {
      this.onAnnounce(packet)
    } else if (packet.type === 'signal') {
      this.onSignal(packet)
    } else {
      console.log(e.data)
    }
  }

  onParcels (packet) {
    this.emit('parcels', packet.parcels)
  }

  // A peer announced themselves
  onAnnounce (packet) {
    this.connectToPeer(packet.uuid)
  }

  // We got signalling data from a peer
  onSignal (packet) {
    const uuid = packet.uuid

    if (packet.initiator) {
      if (this.peers[uuid]) {
        // oh sweet race condition, i'll try cancel my initiated
        // connection, but this is probably going to result in
        // undefined behaviour.

        // (We both tried to initiate to each other at the same
        // time, shouldn't be possible but may be)

        this.peers[uuid].destroy()
        delete this.peers[uuid]
      }

      var p = new Peer({
        initiator: false,
        trickle: false,
        stream: this.stream
      })

      p.on('error', (err) => {
        console.log('error', err)
      })

      p.on('signal', (data) => {
        fetch(`${this.endpoint}/${uuid}/signal`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            initiator: false,
            data: data,
            uuid: this.uuid
          })
        })
      })

      p.signal(packet.data)

      this.addPeer(uuid, p)
    } else {
      if (!this.peers[uuid]) {
        console.error('Response signal from peer we didnt try and connect to')
        return
      }

      this.peers[uuid].signal(packet.data)
    }
  }

  connectToPeer (uuid) {
    console.log(uuid)
    if (this.peers[uuid]) {
      console.log('Already connected...')
      return
    }

    var p = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream
    })

    p.on('error', (err) => {
      console.log('error', err)
    })

    p.on('signal', (data) => {
      fetch(`${this.endpoint}/${uuid}/signal`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          initiator: true,
          data: data,
          uuid: this.uuid
        })
      })

    // console.log('SIGNAL', JSON.stringify(data))
    })

    this.addPeer(uuid, p)
  }

  addPeer (uuid, peer) {
    this.peers[uuid] = peer

    // This user object has properties added to it by
    // other parts of the code, so it needs to be consistent
    // across all emitted events
    const user = {
      uuid,
      send: (packet) => {
        if (peer.connected) {
          peer.send(JSON.stringify(packet))
        }
      }
    }

    // So we can get the user uuid from the peer
    peer.user = user

    const audio = document.createElement('audio')

    peer.on('connect', () => {
      console.log(`[client] connected to peer ${uuid}`)
      peer.send(JSON.stringify({ type: 'hello', startedAt: this.startedAt }))
      this.emit('connect', user)
    })

    peer.on('close', () => {
      audio.remove()
      this.emit('disconnect', user)
    })

    peer.on('stream', function (stream) {
      // got remote audio stream, now let's play it in a audio tag
      document.body.appendChild(audio)
      // audio.src = window.URL.createObjectURL(stream)
      // audio.play()
    })

    peer.on('data', (data) => {
      // console.log('data: ' + data)

      var packet

      try {
        packet = JSON.parse(data)
      } catch (e) {
        console.error(data)
        return
      }

      this.emit(packet.type, Object.assign(packet, { user, type: undefined }))
    })
  }

  // Broadcast to all
  send (packet) {
    Object.keys(this.peers).forEach((uuid) => {
      const peer = this.peers[uuid]

      if (peer.connected) {
        peer.send(JSON.stringify(packet))
      }
    })
  }

  // Pull out the attributes we want to send
  sendChat (message) {
    this.send({
      type: 'chat',
      content: message.content
    })
  }

  sendPatch (patch) {
    this.send({
      type: 'patch',
      patch
    })
  }

  sendEmote (emoji) {
    this.send({
      type: 'emote',
      emoji: emoji
    })
  }
}
