import React from 'react'
import ReactModal from 'react-modal'

import defaultScene from './defaultScene'

const urlParts = window.location.href.split('/')
const sceneName = urlParts[urlParts.length - 1]
function fetchJSON(url) {
  return fetch(url).then(res => res.json())
}

function loadScene(name) {
  let ipnsName, ipfsName
  const defaultData = {
    default: true,
    scene: defaultScene
  }
  return fetchJSON('http://localhost:3000/api/name/' + name)
    .then(objectHash => {
      if (!objectHash.ok) {
        console.log(objectHash.error)
        return defaultData
      }
      ipnsName = objectHash.url.ipns
      ipfsName = objectHash.url.ipfs
      return fetchJSON('http://localhost:3000/api/data/' + ipfsName)
    }).then(objectData => {
      if (objectData.default) {
        return objectData
      }
      if (!objectData.ok) {
        console.log(objectData.error)
        return defaultData
      }
      return { scene: objectData.data, ipfs: ipfsName, ipns: ipnsName}
    })
}

export default class IPFSLoader extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      this.props.reportParcel(this.state.data.scene)
    }
  }
  componentDidMount() {
    loadScene(sceneName)
      .then(scene => {
        this.setState({ loading: false, data: scene, waitDismissal: true })
      })
      .catch(error => this.setState({ loading: false, error }))
  }
  renderContent() {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>Loading scene...</div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error loading scene! { this.state.error }</div>
    }
    if (this.state.waitDismissal) {
      if (this.state.data.default) {
        return <div>
          <h1>Welcome to the Decentraland Editor</h1>
          <button onClick={this.dismiss}>Start editing</button>
        </div>
      } else {
        return (<div className='dismissal uploadPrompt'>
          <h1>Scene loaded from IPFS</h1>
          <p>The IPNS locator is: /ipns/{ this.state.data.ipns }</p>
          <p>The IPFS hash pointed to is: /ipfs/{ this.state.data.ipfs }</p>
          <button onClick={this.dismiss}>Start editing</button>
        </div>)
      }
    }
  }
  render() {
    return <ReactModal isOpen={true} style={ { overlay: { zIndex: 10000 } } }>
      { this.renderContent() }
    </ReactModal>
  }
}
