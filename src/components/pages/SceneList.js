/* globals localStorage */

import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Tabs from './tabs'
import store from '../../lib/store'

require('./SceneList.css')

export default class SceneList extends React.Component {
  constructor () {
    super()

    this.state = {
      scenes: []
    }
  }

  componentDidMount () {
    this.setState({ scenes: Array.from(store.scenes) })
  }

  render () {
    const scenes = (this.state.scenes.length > 0)
      ? this.state.scenes.map((scene) => {
        return <li><Link to={`/scenes/${scene}`}>{scene}</Link></li>
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
