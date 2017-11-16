import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Tabs from './Tabs'

require('./NewScene.css')

export default class NewScene extends React.Component {
  constructor () {
    super()

    this.state = {
      name: '',
      parcels: []
    }
  }

  onInput (e) {
    let name = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')
    this.setState({name})
  }

  render () {
    return (
      <section className='overlay'>
        <div className='new-scene'>
          <Header />
          <Tabs />

          <h1 className='title'>New Parcel</h1>

          <p className='subtitle'>Edit your prototypes for Decentraland's world, in real-time.</p>

          <form id='js-choose-scene' className='choose-scene' method='GET' action='/scene'>
            <input
              type='text'
              required='required'
              placeholder='Scene name'
              value={this.state.name}
              onInput={this.onInput.bind(this)} />

            <br />
            <br />
            <button>Get Started</button> or <Link to='/scenes'>go back</Link>
          </form>
        </div>
      </section>
    )
  }
}
