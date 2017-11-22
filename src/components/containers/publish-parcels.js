/* globals fetch */
import React from 'react'
import ReactModal from 'react-modal'
import { connect } from '../store'

import Events from '../../lib/Events'
import Header from '../components/header'
import Footer from '../components/footer'
import Loading from '../components/loading'
import {getSceneName} from '../../lib/utils'

const sceneName = getSceneName()

class PublishParcels extends React.Component {
  static getState(state) {
    return {
      ipfs: state.ipfs,
    }
  }

  constructor() {
    super(...arguments)

    this.dismiss = () => {
      Events.emit('publishParcelsDismiss')
    }
  }
  componentDidMount() {

  }
  renderContent() {
    return 'Test'
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

export default connect(PublishParcels);
