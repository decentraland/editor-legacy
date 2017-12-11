/* globals fetch */

import React from 'react'
import PropTypes from 'prop-types'
import ComponentsContainer from './ComponentsContainer'
import Events from '../../lib/Events'
import URL from 'url'
import path from 'path'
import assert from 'assert'

import './model-sidebar.less'

const API_KEY = 'AIzaSyB-QXwaKpNUKK5w349BT4DJziLGymwiYTs'
const EDITOR_URL = process.env.REACT_APP_EDITOR_URL || process.env.EDITOR_URL || 'https://editor.decentraland.org';

function truncate (string, length = 50) {
  return string.length < length ? string : string.slice(0, length).replace(/\s$/, '') + '...'
}

function toSlug (string) {
  return string.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-*/, '').replace(/-*$/, '')
}

function fetcher (url) {
  var reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      var dataUrl = reader.result
      var base64 = dataUrl.split(',')[1]
      resolve(base64)
    }

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        reader.readAsDataURL(blob)
      })
  })
}
export default class ModelSidebar extends React.Component {
  // static propTypes = {
  //   entity: PropTypes.object,
  //   visible: PropTypes.bool
  // };

  constructor (props) {
    super(props);
    this.state = {
      open: false,
      entity: props.entity,
      query: 'space shuttle',
      searching: true,
      inserting: false,
      results: {}
    };
  }

  search () {
    this.setState({
      searching: true
    })

    fetch(`https://poly.googleapis.com/v1/assets?format=OBJ&pageSize=50&keywords=${encodeURIComponent(this.state.query)}&key=${API_KEY}`)
      .then((r) => r.json())
      .then((results) => {
        this.setState({results, searching: false})
      })
  }

  componentDidMount () {
    Events.on('componentremoved', event => {
      this.forceUpdate();
    });

    Events.on('componentadded', event => {
      this.forceUpdate();
    });

    this.search()
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
    ga('send', 'event', 'Components', 'toggleSidebar');
  }

  componentChanged = (event) => {
    Events.emit('selectedentitycomponentchanged', event.detail);
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      if (this.state.entity) {
        this.state.entity.removeEventListener('componentchanged', this.componentChanged);
        this.state.entity.removeEventListener('componentinitialized', this.componentCreated);
      }
      if (newProps.entity) {
        newProps.entity.addEventListener('componentchanged', this.componentChanged);
        newProps.entity.addEventListener('componentinitialized', this.componentCreated);
      }
      this.setState({entity: newProps.entity});
    }
  }

  insertModel (model) {
    const format = model.formats.find(f => f.formatType === 'OBJ')
    assert(format, 'Could not find OBJ model')

    const name = toSlug(model.displayName)
    assert(name.length > 0, 'Invalid model name')

    let hasMtl = false

    this.setState({
      inserting: model // 🤔 state parameter name
    })

    function getTransform (url) {
      const objLoader = new THREE.OBJLoader()

      return (
        new Promise((resolve, reject) => {
          objLoader.load(url, (obj) => {
            const bbox = new THREE.Box3().setFromObject(obj);

            // Make the largest dimensional component 2.0 meters
            const size = 2.0 / bbox.size().length()
            const scale = new THREE.Vector3(size, size, size)

            // Place the object on the floor
            const position = bbox.getCenter()
            position.y = bbox.min.y
            position.multiplyScalar(-size)

            resolve({
              position, scale
            })
          })
        })
      )
    }

    // Todo - do objUrl fetch using Promise.all instead
    //   of seperate request
    //   - merge files and uploads arrays
    const objUrl = format.root.url
    const files = []

    fetch(objUrl)
      .then(r => r.text())
      .then(body => {
        files.push({ data: btoa(body), path: `${name}.obj` })

        const uploads = format.resources.map((r) => {
          return fetcher(r.url)
            .then(data => {
              let filename = r.relativePath

              if (path.extname(filename).toLowerCase() === '.mtl') {
                filename = `${name}.mtl`
                hasMtl = true
              }

              files.push({ data, path: filename })
            })
        })

        return Promise.all(uploads)
      })
      .then(() => {
        return getTransform(objUrl)
      })
      .then((transform) => {
        assert(files.length > 0, 'No files ready to upload to IPFS')

        return fetch(`${EDITOR_URL}/api/ipfs`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ files: files })
        }).then(res => res.json()).then(res => {
          if (!res.success) {
            throw new Error(res.error)
          }

          const obj = `https://gateway.ipfs.io/ipfs/${res.url}/${name}.obj`
          const mtl = hasMtl && `https://gateway.ipfs.io/ipfs/${res.url}/${name}.mtl`

          Events.emit('createnewentity', {
            element: 'a-obj-model', 
            components: {
              title: `${model.displayName} by ${model.authorName} licensed under ${model.license.toLowerCase()}`,
              shadow: { cast: true, recieve: true },
              'obj-model': { obj, mtl },
              position: transform.position,
              scale: transform.scale,
            }
          });

          this.setState({
            inserting: false
          })

          return res.url
        })
      })
  }

  onKeyDown (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      this.search()
    }
  }

  render () {
    const entity = this.state.entity;
    const visible = this.props.visible;

    var results

    if (this.state.inserting) {
      results = <div className='inserting'>Inserting {this.state.inserting.displayName}...</div>
    } else if (this.state.searching) {
      results = <div className='searching'><i className='fa fa-spinner' aria-hidden='true'></i></div>
    } else if (this.state.results) {
      results = this.state.results.assets.map((r) => {
        const id = r.name.split('/')[1]

        return (
          <div className='model-result'>
            <h3><a onClick={(e) => {e.preventDefault(); this.insertModel(r)}} href={`https://poly.google.com/view/${id}`}>{r.displayName}</a></h3>
            <p>By {truncate(r.authorName)}</p>
            <img src={r.thumbnail.url} />
          </div>
        )
      })
    }

    if (visible) {
      return (
        <div>
          <div className='model-search'>
            <h2>
              <img src='/img/poly.png' /> Google Poly search
            </h2>

            <div className="search">
              <input 
                id="filter" 
                onInput={(e) => this.setState({query: e.target.value})}
                onKeyDown={this.onKeyDown.bind(this)}
                placeholder="Search..." 
                value={this.state.query} /><span className="fa fa-search"></span>
            </div>

            { results }
          </div>
        </div>
      );
    } else {
      return <div/>;
    }
  }
}
