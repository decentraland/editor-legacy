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

  get ipfshash () {
    return this.props.match.params.ipfshash
  }

  render () {
    if (this.state.loading) {
      return <section className='overlay'>Loading...</section>
    }

    const metadata = {"contact":{"name":"Ben Nolan","email":"","im":"","url":"http://twitter.com/bnolan"},"main":"index.html","scene":{"parcels":["0,0","0,1"]},"policy":{"contentRating":"E"},"display":{"title":"Rocket ship","favicon":""},"communications":{"type":"webrtc","signalling":"https://signalling-01.decentraland.org"}}
    const previewUrl = `https://gateway.ipfs.io/ipfs/${this.ipfshash}/parcel.aframe`

    return (
      <section className='overlay'>
        <div className='new-scene'>
          <Header />
          <Tabs />

          <h1 className='title'>{metadata.display && metadata.display.title}</h1>

          <p className='subtitle'>By {metadata.contact && metadata.contact.name}</p>

          <dl>
            <dt>Author Name</dt>
            <dd>{metadata.contact && metadata.contact.name || 'anonymous'}</dd>
            <dt>Author Email</dt>
            <dd>{metadata.contact && metadata.contact.email || '-'}</dd>
            <dt>Author <abbr title='Instant messenger'>IM</abbr></dt>
            <dd>{metadata.contact && metadata.contact.im || '-'}</dd>
            <dt>Author <abbr title='website'>URL</abbr></dt>
            <dd>{metadata.contact && metadata.contact.url || '-'}</dd>
            <dt>Content Policy</dt>
            <dd>{metadata.policy && metadata.policy.contentRating || '-'}</dd>
            <dt>Parcels</dt>
            <dd>{metadata.scene && metadata.scene.parcels.join(' and ')}</dd>
          </dl>

          <iframe src={previewUrl} />
        </div>
      </section>
    )
  }
}
