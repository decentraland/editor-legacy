/* globals fetch */

import React from 'react';
import PropTypes from 'prop-types';
import ComponentsContainer from './ComponentsContainer';
import Events from '../../lib/Events';
import path from 'path'

import './model-sidebar.less'

const API_KEY = 'AIzaSyB-QXwaKpNUKK5w349BT4DJziLGymwiYTs'

function truncate (string, length = 50) {
  return string.length < length ? string : string.slice(0, length).replace(/\s$/, '') + '...'
}

export default class ModelSidebar extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    visible: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this.state = {
      open: false,
      entity: props.entity,
      query: 'forklift',
      searching: true,
      results: {}
    };
  }

  search () {
    this.setState({
      searching: true
    })

    fetch(`https://poly.googleapis.com/v1/assets?keywords=${encodeURIComponent(this.state.query)}&key=${API_KEY}`)
      .then((r) => r.json())
      .then((results) => {
        console.log(results)

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

  insertModel (id) {
    fetch(`/model/get-url?id=${id}`)
      .then((r) => r.json())
      .then((r) => {
        return fetch('/api/reupload', {
          method: 'POST', 
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ url: r.url })
        })
      })
      .then((r) => r.json())
      .then((res) => {
        console.log('Got...')
        console.dir(res)

        const mtlPath = res.files.find((f) => path.extname(f).toLowerCase() === '.mtl')
        const objPath = res.files.find((f) => path.extname(f).toLowerCase() === '.obj')

        const mtl = mtlPath && `https://gateway.ipfs.io/ipfs/${res.url}/${mtlPath}`
        const obj = objPath && `https://gateway.ipfs.io/ipfs/${res.url}/${objPath}`

        console.log({mtl, obj})

        Events.emit('createnewentity', {element: 'a-obj-model', components: {
            shadow: { cast: true, recieve: true },
            'obj-model': { obj, mtl }
          }});
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

    if (this.state.searching) {
      results = <div className='searching'><i className='fa fa-spinner' aria-hidden='true'></i></div>
    } else if (this.state.results) {
      results = this.state.results.assets.map((r) => {
        const id = r.name.split('/')[1]

        return (
          <div className='model-result' onClick={() => this.insertModel(r.id)}>
            <h3><a onClick={(e) => {e.preventDefault(); this.insertModel(r.id)}} href={`https://poly.google.com/view/${id}`}>{r.displayName}</a></h3>
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
