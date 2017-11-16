/* globals localStorage */

import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Tabs from './Tabs'

require('./SceneList.css')

export default class SceneList extends React.Component {
  constructor () {
    super()

    var scenes = []

    try {
      // Catch in case localStorage is broken
      scenes = JSON.parse(localStorage.getItem('recent-scenes') || [])
    } catch (e) {
    }

    this.state = { scenes: scenes }
  }

  render () {
    const scenes = (this.state.scenes.length > 0)
      ? this.state.scenes.map((s) => {
        return <li><Link to={`/scenes/${s.name}`}>{s.name}</Link></li>
      })
      : <li><small>No scenes</small></li>

    return (
      <section className='overlay'>
        <Header />
        <Tabs />

        <div className='scene-list'>
          <h1>
            My Scenes
          </h1>

          <p>
            Scene you have recently edited:
          </p>

          <ul>{ scenes }</ul>

          <p>
            &raquo; <Link to='/scenes/new'>New Scene</Link>
          </p>
        </div>
      </section>
    )
  }
}
