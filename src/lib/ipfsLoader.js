/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'

import Header from '../components/components/Header'
import Footer from '../components/components/Footer'
import Loading from '../components/components/Loading'
import defaultScene from './defaultScene'
import {getSceneName} from './utils'
import store from './store'

const sceneName = getSceneName()

function fetchJSON (url) {
  return fetch(url).then(res => res.json())
}

function loadScene (name) {
  let ipnsName, ipfsName
  const defaultData = {
    default: true,
    scene: defaultScene
  }

  return fetchJSON('/api/name/' + name)
    .then(objectHash => {
      if (!objectHash.ok) {
        return defaultData
      }
      ipnsName = objectHash.url.ipns
      ipfsName = objectHash.url.ipfs
      return fetchJSON('/api/data/' + ipfsName)
    }).then(objectData => {
      if (objectData.default) {
        return objectData
      }
      if (!objectData.ok) {
        return defaultData
      }
      return { scene: objectData.data, ipfs: ipfsName, ipns: ipnsName}
    })
}

export default class IPFSLoader extends React.Component {
  constructor () {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      this.props.reportParcel(this.state.data.scene)
    }
  }

  componentDidMount () {
    store.addScene(sceneName)

    loadScene(sceneName)
      .then(scene => {
        this.setState({ loading: false, data: scene })
      })
      .catch(error => this.setState({ loading: false, error }))
  }

  renderContent () {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>
        <Loading />
        <h2>Loading scene...</h2>
      </div>
    }

    if (this.state.error) {
      return <div className='errored uploadPrompt'>
        Error loading scene! { this.state.error.toString() }
      </div>
    }
  }

  render () {
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
        { this.renderContent() }
        <Footer />
      </div>
    </ReactModal>
  }
}

