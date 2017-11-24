import React from 'react'
import { connect } from '../store'
import Clipboard from 'clipboard'
import { generateHtml } from '../../lib/exporter'
import Events from '../../lib/Events.js'
import { getParcelArray, createScene, saveString } from '../../lib/utils'
import { saveScene } from '../sagas'
import assert from 'assert'
import ethService from '../ethereum'

/**
 * Tools and actions.
 */
class Toolbar extends React.Component {
  static getState (state) {
    return {
      ipfs: state.ipfs
    }
  }

  static getActions (actions) {
    return {
      updateManyParcelsRequest: actions.updateManyParcelsRequest
    }
  }

  constructor (props) {
    super(props)

    const clipboard = new Clipboard('[data-action="copy-scene-to-clipboard"]', {
      text: trigger => {
        return generateHtml()
      }
    })
    clipboard.on('error', e => {
      // @todo Show Error on the UI
    })

    this.state = {
      saving: false
    }
  }

  saveScene () {
    const html = createScene(document.querySelector('a-entity#parcel'))
    const metadata = this.props.ipfs.metadata

    // Some sanity asserts
    assert(typeof html === 'string')
    assert(typeof metadata === 'object')

    return saveScene(html, metadata)
  }

  publishParcels () {
    this.setState({
      saving: true
    })

    this.saveScene()
      .then((hash) => {
        const parcels = getParcelArray()

        console.log({ parcels, hash })

        return this.props.actions.updateManyParcelsRequest(parcels, hash)
      })
      .then(() => {
        this.setState({
          saving: false
        })
      })
  }

  addEntity (nodeType) {
    Events.emit('createnewentity', {
      element: nodeType,
      components: {
        shadow: { cast: true, receive: true },
        position: '0 0.5 0'
      }
    })
  }

  render () {
    return (
      <div id='scenegraphToolbar'>
        <div className='scenegraph-actions'>
          { this.state.saving
            ? 'Saving...'
            : <a className='button-download' title='Publish' onClick={this.publishParcels.bind(this)}>Publish</a>
          }
        </div>

        <h4>Add...</h4>

        <div className='scenegraph-actions'>
          <a className='button' title='Add a box' onClick={() => this.addEntity('a-box')}>
            <img src='/img/icons/icon-cube.png' />
          </a>
          <a className='button' title='Add a sphere' onClick={() => this.addEntity('a-sphere')}>
            <img src='/img/icons/icon-sphere.png' />
          </a>
          <a className='button' title='Add a model' onClick={() => this.addEntity('a-obj-model')}>
            <img src='/img/icons/icon-obj.png' />
          </a>
          <a className='button' title='Add an html billboard' onClick={() => this.addEntity('a-billboard')}>
            <img src='/img/icons/icon-html.png' />
          </a>
        </div>
      </div>
    );
  }
}

export default connect(Toolbar)
