/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'
import { connect } from '../store'

import Events from '../../lib/Events'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import {getSceneName} from '../../lib/utils'
import { isLoading } from '../utils'

const sceneName = getSceneName()

class IPFSSaveScene extends React.Component {
  static getState(state) {
    return {
      ipfs: state.get('ipfs'),
      ipns: state.get('ipns')
    }
  }

  static getActions(actions) {
    return {
      ipfsSaveSceneRequest: actions.ipfsSaveSceneRequest,
    }
  }

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
    this.props.actions.ipfsSaveSceneRequest(sceneName, this.props.content)
  }
  renderContent() {
    const { ipfs, ipns } = this.props
    if (isLoading(ipfs)) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Uploading to IPFS...</h3>
      </div>
    }
    if (isLoading(ipns)) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Binding scene name to hash...</h3>
      </div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error saving scene! { JSON.stringify(this.state.error) }</div>
    }
    if (!isLoading(ipfs) && !isLoading(ipns)) {
      return (<div className='dismissal uploadPrompt'>
        <h1>Scene "{sceneName}" saved to IPFS</h1>
        <p>The IPNS locator is: /ipns/{ ipns.get('ipnsAddress') }</p>
        <p>The IPFS hash pointed to is: <a href={"https://gateway.ipfs.io/ipfs/" + ipfs.get('hash')} target="_blank">{ ipfs.get('hash') }</a></p>
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

export default connect(IPFSSaveScene);
