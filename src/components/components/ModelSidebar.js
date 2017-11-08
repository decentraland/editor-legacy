/* globals fetch */

import React from 'react';
import PropTypes from 'prop-types';
import ComponentsContainer from './ComponentsContainer';
import Events from '../../lib/Events';
import path from 'path'

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
      query: 'rocket',
      results: []
    };
  }

  search () {
    fetch(`/model/search?q=${encodeURIComponent(this.state.query)}`)
      .then((r) => r.json())
      .then((results) => {
        this.setState({results})
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

  render () {
    const entity = this.state.entity;
    const visible = this.props.visible;

    const results = this.state.results.map((r) => {
      return (<div onClick={() => this.insertModel(r.id)}><h3>{r.name}</h3><img src={r.image} style={{width: '92px'}} /></div>)
    })

    if (visible) {
      return (
        <div id='sidebar'>
          MODEL SEARCH YO

          { results }
        </div>
      );
    } else {
      return <div/>;
    }
  }
}
