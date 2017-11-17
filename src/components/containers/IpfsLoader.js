/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'
import { connect } from '../store'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import defaultScene from '../../lib/defaultScene'
import {getSceneName} from '../../lib/utils'

const sceneName = getSceneName()

function fetchJSON (url) {
  return fetch(url).then(res => res.json())
}

function loadScene (ipfsHash) {
  const defaultData = {
    default: true,
    scene: defaultScene
  }
  return fetchJSON('/api/data/' + ipfsHash)
    .then(objectData => {
      if (objectData.default) {
        return objectData
      }
      if (!objectData.ok) {
        console.log(objectData.error)
        return defaultData
      }
      console.log(objectData)
      return { scene: objectData.data, ipfs: ipfsHash}
    })
}

class IPFSLoader extends React.Component {
  static getState(state) {
    return {
      ethereum: state.ethereum,
      parcelStates: state.parcelStates,
    }
  }

  static getActions(actions) {
    return {
      loadManyParcelRequest: actions.loadManyParcelRequest,
    }
  }

  constructor() {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      this.props.reportParcel(this.state.data.scene)
    }
    //if (this.props.ethereum.success && this.props.meta.loading) this.props.actions.loadMetaRequest(5, -3)
  }
  componentDidMount() {
    // Just testing with this parcel coordinates...
    // and a horrible hack... needs wait until web3 is ready
    // and then fire JUST ONCE
    setTimeout(() => {
      this.props.actions.loadManyParcelRequest([{x: 5, y: -3}, {x: 6, y: -3}, {x: 6, y: -2}])
    }, 1000)
  }
  componentWillReceiveProps(nextProps) {
    const { parcelStates } = nextProps

    if (!parcelStates.loading && parcelStates['5,-3'] && parcelStates['5,-3'].metadata) {
      loadScene(parcelStates['5,-3'].metadata)
        .then(scene => {
          this.setState({ loading: false, data: scene, waitDismissal: true })
        })
        .catch(error => this.setState({ loading: false, error }))
    }
  }
  intro() {
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
    if (this.state.waitDismissal) {
      if (this.state.data.default) {
        return <div className='welcome uploadPrompt'>
          { this.intro() }
          <button onClick={this.dismiss}>Start editing "{sceneName}"</button>
        </div>
      } else {
        return (<div className='dismissal uploadPrompt'>
          { this.intro() }
          <h2>Scene "{sceneName}" loaded from IPFS</h2>
          <p>The IPFS hash pointed to is: /ipfs/{ this.state.data.ipfs }</p>
          <button onClick={this.dismiss}>Start editing</button>
        </div>)
      }
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

export default connect(IPFSLoader)
