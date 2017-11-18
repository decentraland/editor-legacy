/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'
import queryString from 'query-string'
import { connect } from '../store'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Loading from '../components/Loading'

class IPFSLoader extends React.Component {
  static getState(state) {
    return {
      ipfs: state.ipfs,
      ethereum: state.ethereum,
      parcelStates: state.parcelStates
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
      loading: true,
      waitDismissal: true
    }
    this.dismiss = () => {
      this.setState({ waitDismissal: false })
      this.props.reportParcel(this.props.ipfs.scene)
    }
  }
  componentDidMount() {
    const query = queryString.parse(location.search)

    if (!query.parcels) {
      this.loadParcels([{x: 0, y: 0}])
      return
    }

    const parcels = query.parcels.split(';')
    const coordinatesArray = parcels.map(a => a.split(',')).map(a => ({x: a[0], y: a[1]}))

    this.loadParcels(coordinatesArray)
  }
  loadParcels = (coordinates) => {
    // Hack... needs to wait until web3 is ready
    // and then fire JUST ONCE
    setTimeout(() => {
      if (this.props.ethereum.success) {
        console.log('loading many parcels...')
        this.props.actions.loadManyParcelRequest(coordinates)
      }
    }, 1000)
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

    const { ipfs } = this.props
    if (ipfs.loading) {
      return <div className='loading uploadPrompt'>
        { this.intro() }
        <Loading />
        <h2>Loading scene...</h2>
      </div>
    }
    if (ipfs.error) {
      return <div className='errored uploadPrompt'>
        { this.intro() }
        Error loading scene! { ipfs.error }
      </div>
    }
    if (this.state.waitDismissal) {
      if (ipfs.scene.default) {
        return <div className='welcome uploadPrompt'>
          { this.intro() }
          <button onClick={this.dismiss}>Start editing</button>
        </div>
      } else {
        return (<div className='dismissal uploadPrompt'>
          { this.intro() }
          <h2>Scene loaded from IPFS</h2>
          <p>The IPFS hash pointed to is: /ipfs/{ ipfs.hash }</p>
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
