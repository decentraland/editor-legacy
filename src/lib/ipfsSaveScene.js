import React from 'react'

const urlParts = window.location.href.split('/')
const sceneName = urlParts[urlParts.length - 1]

function bindName(name, hash) {
  return fetch(`http://localhost:3000/api/name/${name}/${hash}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => res.address)
}

function saveScene(content) {
  // return: string, ipfs hash
  return fetch('http://localhost:3000/api/ipfs', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ files: [{ data: new Buffer(content).toString('base64'), path: 'parcel.aframe' }] })
  }).then(res => res.json()).then(res => {
    if (!res.success) {
      throw new Error(res.error)
    }
    return res.url
  })
}

export default class IPFSSaveScene extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      Events.emit('savedismiss')
      this.setState({ loading: true })
    }
  }
  componentDidMount() {
    let ipfsHash
    saveScene(this.props.content)
      .then(sceneHash => {
        ipfsHash = sceneHash
        this.setState({ loading: false, bindName: true })
        return bindName(sceneName, sceneHash)
      })
      .then(ipns => {
        this.setState({ bindName: false, waitDismissal: true, ipfsName: ipfsHash, ipnsName: ipns })
      })
      .catch(error => this.setState({ loading: false, error }))
  }
  render() {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>Uploading to IPFS...</div>
    }
    if (this.state.bindName) {
      return <div className='loading uploadPrompt'>Binding scene name to hash...</div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error saving scene! { JSON.stringify(this.state.error) }</div>
    }
    if (this.state.waitDismissal) {
      return (<div className='dismissal uploadPrompt'>
        <h1>Scene saved to IPFS</h1>
        <p>The IPNS locator is: /ipns/{ this.state.ipnsName }</p>
        <p>The IPFS hash pointed to is: /ipfs/{ this.state.ipfsName }</p>
        <button onClick={this.dismiss}>Continue editing</button>
      </div>)
    }
    return <div className='errored uploadPrompt'>Unexpected internal state!</div>
  }
}
