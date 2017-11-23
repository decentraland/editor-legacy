import React from 'react';
import PropTypes from 'prop-types';
import { Creatable } from 'react-select'
import { connect } from '../store'
import {InputWidget} from '../widgets';
import PropertyRow from '../components/PropertyRow';
import Collapsible from '../Collapsible';
import Events from '../../lib/Events';
import {saveString} from '../../lib/utils';

class MetadataForm extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

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
  }

  componentDidMount () {

  }

  renderCommonAttributes () {

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
            <span className='text'>{key}</span>
            <input type="text" className="string" name={key} defaultValue={value} />
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

    console.log(this.props.ipfs.hash)
    return (
      <div>
        <form onSubmit={e => this.onMetaFormSubmit(e)}>
          <Collapsible>
            <div className='collapsible-header'>
              <span className='entity-name'>Contact info</span>
            </div>
            <div className='collapsible-content'>
              {formFromMeta(meta.contact)}
            </div>
          </Collapsible>
          <Collapsible>
            <div className='collapsible-header'>
              <span className='entity-name'>Comunications</span>
            </div>
            <div className='collapsible-content'>
              {formFromMeta(meta.communications)}
            </div>
          </Collapsible>
          <Collapsible>
            <div className='collapsible-header'>
              <span className='entity-name'>Policy</span>
            </div>
            <div className='collapsible-content'>
              <div className="row">
                <span className='text'>Content rating</span>
                <input className="string" type="text" name="contentRating" defaultValue={meta.policy.contentRating} />
              </div>
            </div>
          </Collapsible>
          <Collapsible>
            <div className='collapsible-header'>
              <span className='entity-name'>Display info</span>
            </div>
            <div className='collapsible-content'>
              {formFromMeta(meta.display)}
            </div>
          </Collapsible>
          <Collapsible>
            <div className='collapsible-header'>
              <span className='entity-name'>Tags</span>
            </div>
            <div className='collapsible-content'>
              <Creatable
                name="tags"
                className="string"
                options={options}
                onChange={getTags}
                value={this.state.tags}
                clearable
                searchable
                multi={true}
              />
              <div className="meta-edit-buttons uploadPrompt">
                <button type="submit">Update metadata</button>
              </div>
            </div>
          </Collapsible>
        </form>
      </div>
    )
  }

  onMetaFormSubmit = (event) => {
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
    this.props.actions.ipfsSaveSceneRequest(metadata.display.title, this.props.content, metadata)
  }

  render () {
    const scene = document.querySelector('a-scene');
    this.rendererStats = scene.renderer.info.render;

    const { geometryLimitError } = this.state

    const limitMessage = geometryLimitError ? (<p style={{color: 'red'}}>
      You cannot publish scene with more than 1,000,000 vertices!
    </p>) : ''

    return (
      <div>
        <Collapsible>
          <div className='collapsible-header'>
            <span className='entity-name'>Metadata form</span>
          </div>
          <div className='collapsible-content'>
            <div className='row'>
              <span className='text'>Faces</span>
              <input type="text" className="string" value={this.rendererStats.faces} disabled />
            </div>
            <div className='row' style={{color: geometryLimitError ? 'red' : 'inherit'}}>
              <span className='text'>Vertices</span>
              <input type="text" className="string" value={this.rendererStats.vertices} disabled />
            </div>
          </div>
        </Collapsible>
        {this.renderMetaEditForm()}
      </div>
    );
  }
}

export default connect(MetadataForm)
