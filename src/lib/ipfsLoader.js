import React from 'react'
import ReactDOM from 'react-dom'

import inspector from './inspector'
import defaultScene from './defaultScene'

const urlParts = window.location.href.split('/')
const sceneName = urlParts[urlParts.length - 1]
function fetchJSON(url) {
  return fetch(url).then(res => res.json())
}

async function loadScene(name) {
  const objectHash = await fetchJSON('http://localhost:3000/api/name/' + name)
  if (!objectHash.ok) {
    console.log(objectHash.error)
    return defaultScene
  }
  const objectData = await fetchJSON('http://localhost:3000/api/data/' + objectHash.address)
  if (!objectData.ok) {
    console.log(objectData.error)
    return defaultScene
  }
  return objectData.data
}

export default class IPFSLoader extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      const content = document.createElement(this.state.data)
      this.props.reportParcel(content)
    }
  }
  componentDidMount() {
    loadScene(sceneName).then(scene => {
      this.setState({ loading: false, data: scene, waitDismissal: true })
    }).catch(error => {
      this.setState({ loading: false, error })
    })
  }
  render() {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>Loading scene...</div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error loading scene! { this.state.error }</div>
    }
    if (this.state.waitDismissal) {
      return (<div className='dismissal uploadPrompt'>
        <h1>Scene loaded from IPFS</h1>
        <p>The IPNS locator is: /ipns/{ this.state.ipns }</p>
        <p>The IPFS hash pointed to is: /ipfs/{ this.state.ipfs }</p>
        <button onClick={this.dismiss}>Start editing</button>
      </div>)
    }
    return <div className='errored uploadPrompt'>Unexpected internal state!</div>
  }
}
