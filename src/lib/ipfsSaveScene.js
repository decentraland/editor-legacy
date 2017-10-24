import React from 'react'
import ReactModal from 'react-modal'

import Events from './Events'
import Header from '../components/components/Header'
import Footer from '../components/components/Footer'
import Loading from '../components/components/Loading'

const urlParts = window.location.href.split('/')
const sceneName = urlParts[urlParts.length - 1]

function bindName(name, hash) {
  return fetch(`/api/name/${name}/${hash}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => res.address)
}

function saveScene(content) {
  // return: string, ipfs hash
  return fetch('/api/ipfs', {
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
  renderContent() {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Uploading to IPFS...</h3>
      </div>
    }
    if (this.state.bindName) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Binding scene name to hash...</h3>
      </div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error saving scene! { JSON.stringify(this.state.error) }</div>
    }
    if (this.state.waitDismissal) {
      return (<div className='dismissal uploadPrompt'>
        <h1>Scene "{sceneName}" saved to IPFS</h1>
        <p>The IPNS locator is: /ipns/{ this.state.ipnsName }</p>
        <p>The IPFS hash pointed to is: <a href={"https://gateway.ipfs.io/ipfs/" + this.state.ipfsName} target="_blank">{ this.state.ipfsName }</a></p>
        <button onClick={this.dismiss}>Continue editing</button>
      </div>)
    }
    return <div className='errored uploadPrompt'>Unexpected internal state!</div>
  }
  render() {
    return <ReactModal isOpen={true} style={
      {
        overlay: {
          zIndex: 10000
        },
        content: {
          background: '#2b2b2b',
          color: '#ccc'
        }
      }
    }>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <Header />
        { this.renderContent() }
        <Footer />
      </div>
    </ReactModal>
  }
}
