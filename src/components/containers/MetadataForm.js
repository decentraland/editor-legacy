import React from 'react'
import { Creatable } from 'react-select'
import { connect } from '../store'
import Collapsible from '../Collapsible'
import { getParcelArray, createScene } from '../../lib/utils'
import { saveScene, updateManyParcelsMetadata } from '../sagas'
import baseMetadata from '../utils/parcel-metadata'
import { updateManyParcelsRequest } from '../actions'
import PreviewParcels from '../components/preview-parcels'
import assert from 'assert'
import ethService from '../ethereum'
import ParcelBoundary from '../../lib/parcel-boundary'

class MetadataForm extends React.Component {
  static getState(state) {
    return {
      ipfs: state.ipfs
    }
  }

  constructor() {
    super(...arguments)

    this.state = {
      editMetadata: false,
      loading: true,
      saving: false,
      valid: false,
      invalidObjects: []
    }
  }

  componentDidMount () {
    this.testBoundaries()
  }

  get object3D () {
    return document.querySelector('a-entity#parcel').object3D
  }

  testBoundaries () {
    const parcels = getParcelArray()
    console.log(parcels)

    const boundary = new ParcelBoundary(parcels, this.object3D)
    const valid = boundary.validate()
    const invalidObjects = boundary.invalidObjects

    console.log(boundary, valid, invalidObjects)
    this.setState({
      valid, invalidObjects
    })
  }

  renderMetaEditForm() {
    const { ipfs } = this.props
    const meta = ipfs.metadata || this.state.meta

    const formFromMeta = (metaObject) => Object.entries(metaObject).map(([key, value]) => {
      if (key !== 'preview') {
        return (
          <div key={key} className='row'>
            <span className='text'>{key}</span>
            <input type='text' className='string' name={key} defaultValue={value} />
          </div>
        )
      }
    })

    // Just dummy tags for now...
    var options = [
      { value: 'land', label: 'land' },
      { value: 'decentraland', label: 'decentraland' },
      { value: 'parcel', label: 'parcel' }
    ];

    const getTags = (val) => {
      this.setState({ tags: val.map(t => t.value) });
    };

    return (
      <div>
        <form onSubmit={e => this.onPublish(e)}>
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
              { this.state.valid && (
                <div className='meta-edit-buttons uploadPrompt'>
                  <button type='submit' disabled={ipfs.saving}>
                    {ipfs.saving ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              ) }
            </div>
          </Collapsible>
        </form>
      </div>
    )
  }

  onPublish (event) {
    event.preventDefault()

    this.setState({
      saving: true
    })

    const html = createScene(document.querySelector('a-entity#parcel'))
    assert(typeof html === 'string')

    const metadata = this.getMetadata(event)
    assert(typeof metadata === 'object')

    saveScene(html, metadata)
      .then((hash) => {
        const parcels = getParcelArray()
        return ethService.updateManyParcelsMetadata(parcels, hash)
      })
      .then(() => {
        this.setState({
          saving: false
        })
      })
  }

  checkGeometry (stats) {
    if (stats && stats.vertices > 1000000) {
      throw Error('Vertices limit is 1,000,000!')
    }
  }

  getMetadata (event) {
    // The parcel data is gotten from the URL bar, we ignore what
    // the metadata says about the parcels
    const parcels = getParcelArray().map(p => `${p.x},${p.y}`)

    const { tags } = this.state

    const metadata = Object.assign({}, baseMetadata, {
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
      scene: {
        parcels
      },
      tags
    })

    // try {
    //   this.checkGeometry(this.rendererStats);
    // } catch (err) {
    //   this.setState({ geometryLimitError: err.message });
    //   console.log(err)
    //   return;
    // }

    return metadata
    // this.setState({ meta: metadata })
  }

  render () {
    const scene = document.querySelector('a-scene');
    this.rendererStats = scene.renderer.info.render;

    const { geometryLimitError } = this.state

    var warning

    if (!this.state.valid) {
      warning = <p>Cannot save, {this.state.invalidObjects.length} objects do not fit inside your parcel boundaries</p>
    }

    return (
      <div>
        <Collapsible>
          <div className='collapsible-header'>
            <span className='entity-name'>Metadata form</span>
          </div>
          <div className='collapsible-content'>
            <div className='row'>
              <span className='text'>Faces</span>
              <input type='text' className='string' value={this.rendererStats.faces} disabled />
            </div>
            <div className='row' style={{color: geometryLimitError ? 'red' : 'inherit'}}>
              <span className='text'>Vertices</span>
              <input type='text' className='string' value={this.rendererStats.vertices} disabled />
            </div>
            <div>
              <b>Parcels:</b>
              <PreviewParcels parcels={getParcelArray()} />
            </div>
            { warning }
          </div>
        </Collapsible>
        {this.renderMetaEditForm()}
      </div>
    );
  }
}

export default connect(MetadataForm)
