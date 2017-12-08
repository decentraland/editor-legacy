/* globals fetch */

import React from 'react'
import { Link } from 'react-router-dom'
import Header from './header'
import Tabs from './tabs'
import getParcelsFromURL from '../../lib/parcels'
import PreviewParcels from './parcel-preview'

import './show-scene.css'

export default class NewScene extends React.Component {
  constructor () {
    super()

    this.state = {
      loading: true
    }
  }

  componentDidMount () {
    this.load()
  }

  load () {
    fetch(`https://gateway.ipfs.io/ipfs/${this.ipfshash}/scene.json`)
      .then(r => r.json())
      .then(metadata => this.setState({ loading: false, metadata }))

    fetch(`https://gateway.ipfs.io/ipfs/${this.ipfshash}/parcel.aframe`)
      .then(r => r.text())
      .then(source => this.setState({ source }))
  }

  get ipfshash () {
    return this.props.match.params.ipfshash
  }

  render () {
    if (this.state.loading) {
      return <section className='overlay'>Loading...</section>
    }

    const metadata = this.state.metadata
    const previewUrl = `https://gateway.ipfs.io/ipfs/${this.ipfshash}/parcel.aframe`

    var editUrl

    if (metadata.scene && metadata.scene.parcels) {
      editUrl = `/edit?parcels=${metadata.scene.parcels.join(';')}`
    } else {
      editUrl = `/edit?hash=${this.ipfshash}`
    }

    return (
      <section className='overlay'>
        <div className='show-scene'>
          <Header />
          <Tabs />

          <h1>{metadata.display && metadata.display.title}</h1>

          <p>
            <a href={editUrl}>Edit</a>
          </p>

          <dl>
            <dt>Preview URL</dt>
            <dd><small><a href={previewUrl}>{previewUrl.slice(0, 40)}...</a></small></dd>
            <dt>Author Name</dt>
            <dd><b>{metadata.contact && metadata.contact.name || 'anonymous'}</b></dd>
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

          <h4>Debug Mode Preview</h4>

          <iframe src={previewUrl} />

          { this.state.source && <div><h4>Source code</h4><pre><code>{this.state.source}</code></pre></div>}
        </div>
      </section>
    )
  }
}
