/* globals AFRAME */

import React from 'react'
import { connect } from '../store'
import Clipboard from 'clipboard'
import { generateHtml } from '../../lib/exporter'
import Events from '../../lib/Events.js'
import { getParcelArray, createScene, saveString } from '../../lib/utils'
import { saveScene } from '../sagas'

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

  onSave () {
    AFRAME.INSPECTOR.selectEntity(document.querySelector('a-scene'))
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
            : <a className='button-download' title='Save' onClick={this.onSave.bind(this)}>Save...</a>
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
