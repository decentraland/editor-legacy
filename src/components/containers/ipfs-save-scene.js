/* globals fetch */

import React from 'react'
import ReactModal from 'react-modal'
import { Creatable } from 'react-select'
import { connect } from '../store'

import Events from '../../lib/Events'
import Header from '../components/header'
import Footer from '../components/footer'
import Loading from '../components/loading'
import {getSceneName} from '../../lib/utils'

import 'react-select/dist/react-select.css';

const sceneName = getSceneName()

class IPFSSaveScene extends React.Component {
  static getState(state) {
    return {
      ipfs: state.ipfs,
    }
  }

  static getActions(actions) {
    return {
      ipfsSaveSceneRequest: actions.ipfsSaveSceneRequest
    }
  }

  constructor() {
    super(...arguments)
    this.state = {
      editMetadata: false,
      loading: true
    }
    this.dismiss = () => {
      Events.emit('savedismiss')
      this.setState({ loading: true })
    }
  }
  componentDidMount() {
    this.saveScene()
  }
  saveScene = () => {
    console.log(this.props.ipfs.metadata)
    this.props.actions.ipfsSaveSceneRequest(sceneName, this.props.content, this.props.ipfs.metadata)
  }
  renderContent() {
    const { ipfs, ipns } = this.props
    if (ipfs.loading) {
      return <div className='loading uploadPrompt'>
        <Loading/>
        <h3>Uploading to IPFS...</h3>
      </div>
    }
    if (this.state.error) {
      return <div className='errored uploadPrompt'>Error saving scene! { JSON.stringify(this.state.error) }</div>
    }
    if (!ipfs.loading) {
      return (<div className='dismissal uploadPrompt'>
        { this.renderMetaEditForm() }
        <h1>Scene "{sceneName}" saved to IPFS</h1>
        <p>The IPFS hash pointed to is: <a href={"https://gateway.ipfs.io/ipfs/" + ipfs.hash} target="_blank">{ ipfs.hash }</a></p>
        <button onClick={this.dismiss}>Continue editing</button>
      </div>)
    }
    return <div className='errored uploadPrompt'>Unexpected internal state!</div>
  }

  checkGeometry = (stats) => {
    if (stats && stats.vertices > 1000000) {
      throw Error('Vertices limit is 1,000,000!');
    }
  }

  renderMetaEditForm() {
    const { ipfs, ipns } = this.props
    const meta = ipfs.metadata

    const formFromMeta = (metaObject) => Object.entries(metaObject).map(([key, value]) => {
      console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
      if (key !== 'preview') {
        return (
          <div key={key} className="row">
            <label htmlFor={`dcl-parcelmeta-contact-${key}`}>{key}</label><br />
            <input id={`dcl-parcelmeta-contact-${key}`} type="text" name={key} defaultValue={value} />
          </div>
        );
      }
    });

    // Just dummy tags for now...
    var options = [
      { value: 'land', label: 'land' },
      { value: 'decentraland', label: 'decentraland' },
      { value: 'parcel', label: 'parcel' }
    ];

    const getTags = (val) => {
      this.setState({ tags: val.map(t => t.value) });
    };

    const scene = document.querySelector('a-scene');
    this.rendererStats = scene.renderer.info.render;

    const { geometryLimitError } = this.state

    const limitMessage = geometryLimitError ? (<p style={{color: 'red'}}>
      You cannot publish scene with more than 1,000,000 vertices!
    </p>) : ''
    console.log(this.props.ipfs.hash)
    return (
      <div>
        <div>
          <p>Faces: {this.rendererStats.faces}</p>
          <p style={{color: geometryLimitError ? 'red' : 'inherit'}}>
            Vertices: {this.rendererStats.vertices}
          </p>
          {limitMessage}
        </div>
        <form onSubmit={e => this.onFormSubmit(e)}>
          <div className="meta-edit-form">
            <div className="meta-edit-column">
              <h3>Contact info</h3>
              {formFromMeta(meta.contact)}
            </div>
            <div className="meta-edit-column">
              <h3>Comunications</h3>
              {formFromMeta(meta.communications)}
              <h3>Policy</h3>
              <div className="row">
                <label htmlFor="dcl-parcelmeta-contact-contentRating">Content rating</label><br />
                <input id="dcl-parcelmeta-contact-contentRating" type="text" name="contentRating" defaultValue={meta.policy.contentRating} />
              </div>
            </div>
            <div className="meta-edit-column">
              <h3>Display info</h3>
              {formFromMeta(meta.display)}
              <h3>Tags</h3>
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
          </div>
          <div className="meta-edit-buttons uploadPrompt">
            <button type="submit">Update metadata</button>
          </div>
        </form>
      </div>
    )
  }

  onFormSubmit = (event) => {
    const { tags } = this.state
    event.preventDefault();
    console.log(event.target)
    const metadata = Object.assign({}, this.props.ipfs.metadata, {
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
      policy: {
        contentRating: event.target.contentRating.value
      },
      tags
    });

    try {
      this.checkGeometry(this.rendererStats);
    } catch (err) {
      this.setState({ geometryLimitError: err.message });
      console.log(err)
      return;
    }

    this.setState({ meta: metadata })
    console.log(metadata)
    this.props.actions.ipfsSaveSceneRequest(sceneName, this.props.content, metadata)
  }

  renderMetadata(type) {
    const { ipfs } = this.props
    console.log(ipfs, ipfs.metadata)
    const metadata = !ipfs.loading && ipfs.metadata || parcelMeta
    return Object.entries(metadata[type]).map(([key, value]) => {
      console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
      if (key !== 'preview') {
        return (
          <div key={key} style={{ paddingBottom: '5px' }}>
            <div style={{ display: 'inline-block', fontWeight: 'bold' }}>{String(key).charAt(0).toUpperCase() + String(key).substring(1)}</div>:{' '}
            <div style={{ display: 'inline-block' }}>{value}</div>
          </div>
        );
      }
    })
  }

  toggleEditMeta = () => {
    this.setState((prevState, props) => (
      { editMetadata: !prevState.editMetadata }
    ))
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
