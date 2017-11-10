/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'
import { Creatable } from 'react-select'
import { connect } from '../store'

import Events from '../../lib/Events'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import {getSceneName} from '../../lib/utils'
import { isLoading } from '../utils'
import parcelMeta from '../utils/parcel-metadata'

import 'react-select/dist/react-select.css';

console.log(parcelMeta)
const sceneName = getSceneName()

class PublishParcels extends React.Component {
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
      Events.emit('publishdismiss')
      this.setState({ loading: true })
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
  }
  componentDidMount() {
    //this.props.actions.ipfsSaveSceneRequest(sceneName, this.props.content)
  }
  renderContent() {
    const { ipfs, ipns } = this.props
    /* if (isLoading(ipfs)) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Uploading to IPFS...</h3>
      </div>
    } */
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error saving scene! { JSON.stringify(this.state.error) }</div>
    }
    /* if (!isLoading(ipfs) && !isLoading(ipns)) {
      return (<div className='dismissal uploadPrompt'>
        <h1>Scene "{sceneName}" saved to IPFS</h1>
        <p>The IPNS locator is: /ipns/{ ipns.get('ipnsAddress') }</p>
        <p>The IPFS hash pointed to is: <a href={"https://gateway.ipfs.io/ipfs/" + ipfs.get('hash')} target="_blank">{ ipfs.get('hash') }</a></p>
        <button onClick={this.dismiss}>Continue editing</button>
      </div>)
    } */
    //return <div className='errored uploadPrompt'>Unexpected internal state!</div>

    // This is WIP, only static form right now
    const formFromMeta = (metaObject) => Object.entries(metaObject).map(([key, value]) => {
      console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
      if (key !== 'preview') {
        return (
          <div key={key} className="form-control">
            <label htmlFor={`dcl-parcelmeta-contact-${key}`}>{key}</label><br />
            <input id={`dcl-parcelmeta-contact-${key}`} type="text" name={key} defaultValue={value} />
          </div>
        );
      }
    });

    var options = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ];

    const getTags = (val) => {
      this.setState({ tags: val.map(t => t.value) });
    };

    const scene = document.querySelector('a-scene');
    this.rendererStats = scene.renderer.info.render;

    const { geometryLimitError } = this.state

    const limitMessage = geometryLimitError ? (<p style={{color: 'red'}}>
      You cannot publish scene with more than 100,000 vertices!
    </p>) : ''

    return (
      <div>
        <div>
          <p>Faces: {this.rendererStats.faces}</p>
          <p style={{color: geometryLimitError ? 'red' : 'inherit'}}>
            Vertices: {this.rendererStats.vertices}
          </p>
          {limitMessage}
        </div>
        <form method="POST" onSubmit={this.onFormSubmit}>
          <h3>Contact info</h3>
          {formFromMeta(parcelMeta.contact)}
          <h3>Comunications</h3>
          {formFromMeta(parcelMeta.communications)}
          <h3>Display info</h3>
          {formFromMeta(parcelMeta.display)}
          <h3>Tags</h3>
          <div>
            <Creatable
              name="tags"
              options={options}
              onChange={getTags}
              value={this.state.tags}
              clearable
              searchable
              multi={true}
            />
          </div>
          <button type="submit">Submit</button>{' '}
          <button onClick={this.dismiss}>Close</button>
        </form>
      </div>
    )
  }

  checkGeometry = (stats) => {
    if (stats && stats.vertices > 100000) {
      throw Error('Vertices limit is 100,000!');
    }
  }

  onFormSubmit(event) {
    event.preventDefault();
    console.log(event.target)
    const data = Object.assign({}, parcelMeta, {
      contact: {
        name: event.target.name.value,
        email: event.target.email.value,
        im: event.target.im.value,
        url: event.target.url.value
      },
      communications: {
        type: event.target.type.value,
        signalling: event.target.signalling.value
      },
      display: {
        title: event.target.title.value,
        favicon: event.target.favicon.value
      },
      tags: this.state.tags
    });

    try {
      this.checkGeometry(this.rendererStats);
    } catch (err) {
      this.setState({ geometryLimitError: err.message });
      console.log(err);
    }

    console.log(data)
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
        { this.renderContent() }
      </div>
    </ReactModal>
  }
}

export default connect(PublishParcels);
