import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Tabs from './tabs'
import getParcelsFromURL from '../../lib/parcels'
import PreviewParcels from './parcel-preview'

import './new-scene.css';

export default class NewScene extends React.Component {
  constructor () {
    super()

    this.state = {
      name: '',
      parcels: getParcelsFromURL()
    }
  }

  onInput (e) {
    let name = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')
    this.setState({name})
  }

  onSubmit (e) {
    e.preventDefault()

    this.props.history.push(`/scene/${this.state.name}`)
  }

  render () {
    return (
      <section className='overlay'>
        <div className='new-scene'>
          <Header />
          <Tabs />

          <h1 className='title'>Create Scene</h1>

          <p className='subtitle'>Edit your prototypes for Decentraland's world, in real-time.</p>

          <form id='js-choose-scene' className='choose-scene' onSubmit={this.onSubmit.bind(this)}>
            <input
              type='text'
              required='required'
              placeholder='Scene name'
              value={this.state.name}
              onInput={this.onInput.bind(this)} />

            <br />
            <br />

            {this.state.parcels && <PreviewParcels parcels={this.state.parcels} />}

            <br />
            <br />

            <button>Create Scene</button> or <Link to='/scenes'>go back</Link>
          </form>
        </div>
      </section>
    )
  }
}
