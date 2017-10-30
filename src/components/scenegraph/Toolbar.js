var INSPECTOR = require('../../lib/inspector.js');
import React from 'react';
import Clipboard from 'clipboard';
import {getSceneName, generateHtml} from '../../lib/exporter';
import Events from '../../lib/Events.js';
import {saveString} from '../../lib/utils';
import MotionCapture from './MotionCapture';

const LOCALSTORAGE_MOCAP_UI = 'aframeinspectormocapuienabled';

/**
 * Tools and actions.
 */
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    const clipboard = new Clipboard('[data-action="copy-scene-to-clipboard"]', {
      text: trigger => {
        return generateHtml();
      }
    });
    clipboard.on('error', e => {
      // @todo Show Error on the UI
    });

    Events.on('togglemotioncapture', () => {
      this.toggleMotionCaptureUI();
    });

    this.state ={
      motionCaptureUIEnabled: JSON.parse(localStorage.getItem(LOCALSTORAGE_MOCAP_UI))
    };
  }

  enterVR () {
    Events.emit('entervr')
  }

  exportSceneToGLTF () {
    INSPECTOR.exporters.gltf.parse(AFRAME.scenes[0].object3D, function (result) {
      var output = JSON.stringify(result, null, 2);
      saveString(output, 'scene.gltf', 'application/json');
    });
  }

  saveScene () {
    Events.emit('savescene')
  }

  addEntity (nodeType) {
    Events.emit('createnewentity', {element: nodeType, components: {}});
  }

  toggleMotionCaptureUI = () => {
    localStorage.setItem(LOCALSTORAGE_MOCAP_UI, !this.state.motionCaptureUIEnabled);
    this.setState({motionCaptureUIEnabled: !this.state.motionCaptureUIEnabled});
  }

  render () {
    return (
      <div id="scenegraphToolbar">
        <div className='scenegraph-actions'>
          <a className='button-download' title='Save HTML' onClick={this.saveScene}>Save</a>
        </div>

        <div className='scenegraph-actions'>
          <a className='button-download' title='Edit in VR' onClick={this.enterVR}>Edit in VR</a>
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
        </div>

        {this.state.motionCaptureUIEnabled && <MotionCapture/>}
      </div>
    );
  }
}
