/* globals location */

import React from 'react'
import ReactModal from 'react-modal'
import queryString from 'query-string'
import { connect } from '../store'

import Events from '../../lib/Events'
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
      loadManyParcelRequest: actions.loadManyParcelRequest
    }
  }

  constructor() {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      this.props.reportParcel(this.props.ipfs.scene)
    }
  }

  componentDidMount() {
    const query = queryString.parse(location.search)

    if (!query.parcels) {
      this.setState({
        loading: false,
        error: 'No parcels specified'
      })
      return
    }

    const parcels = query.parcels.split(';')
    const coordinatesArray = parcels.map(a => a.split(',')).map(a => ({x: a[0], y: a[1]}))

    this.loadParcels(coordinatesArray)
  }

  componentDidUpdate() {
    if (this.props.ipfs.newScene) {
      Events.emit('injectscenebound')
    }
  }

  loadParcels (coordinates) {
    // Hack... needs to wait until web3 is ready
    // and then fire JUST ONCE

    setTimeout(() => {
      const connected = this.props.ethereum.success
      const isMainnet = connected && this.props.ethereum.network === 'main'

      if (connected && isMainnet) {
        this.setState({
          loading: false,
          error: 'Your MetaMask is currently set to mainnet!'
        })
        return
      }

      if (connected && !isMainnet) {
        this.props.actions.loadManyParcelRequest(coordinates)
        return
      }
    }, 1000)
  }

  intro() {
    return <h1 key='1'>Welcome to the Decentraland Scene Editor!</h1>
  }

  componentWillUpdate (nextProps) {
    if (!nextProps.ipfs.loading && !this.state.error) {
      setTimeout(() => this.dismiss(), 50)
    }
  }

  renderContent() {
    const { ipfs, ethereum } = this.props

    if (ethereum.error) {
      return <div className='errored uploadPrompt'>
        { this.intro() }
        <p>
          Error connecting to web3 or metamask.
        </p>

        <p className='error'>
          { ethereum.error.toString() }
        </p>
      </div>
    }

    if (ipfs.error || this.state.error) {
      return <div className='errored uploadPrompt'>
        { this.intro() }
        <p>Error loading scene! { ipfs.error || this.state.error }</p>
      </div>
    }

    if (ipfs.loading) {
      return <div className='loading uploadPrompt'>
        { this.intro() }
        <Loading />
        <h2>Loading scene...</h2>
      </div>
    }
  }
  render() {
    return <ReactModal isOpen style={{
      overlay: { zIndex: 10000 },
      content: { background: '#2b2b2b', color: '#ccc', height: '50%', top: '25%', marginLeft: '10%', marginRight: '10%' }
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <Header />
        { this.renderContent() }
        <Footer />
      </div>
    </ReactModal>
  }
}

export default connect(IPFSLoader)
