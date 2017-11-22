/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'

import Header from '../components/components/Header'
import Footer from '../components/components/Footer'
import Loading from '../components/components/Loading'
import defaultScene from './defaultScene'
import {getSceneName} from './utils'

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
        console.log(objectHash.error)
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
        console.log(objectData.error)
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
    loadScene(sceneName)
      .then(scene => {
        this.setState({ loading: false, data: scene })
      })
      .catch(error => this.setState({ loading: false, error }))
  }

  intro () {
    return [
      <h1 key='1'>Welcome to the Decentraland Scene Editor!</h1>,
      <p key='2'>This editor allows real-time collaboration when working on A-Frame scenes. You can edit in real time a scene with other users while communicating through voice and text chat. All changes to the parcel you are editing are shared in real time with other users looking at the same scene. </p>,
      <p key='3'>Support for sharing materials, textures, and models is in experimental stage.</p>,
      <p key='4'>The contents can be stored to the IPFS network using the <span className="fa fa-download" title="Save HTML"></span> button on the top left corner.</p>
    ]
  }
  renderContent() {
    if (this.state.loading) {
      return <div className='loading uploadPrompt'>
        { this.intro() }
        <Loading />
        <h2>Loading scene...</h2>
      </div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>
        { this.intro() }
        Error loading scene! { this.state.error }
      </div>
    }
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

