import React from 'react'
import { NavLink } from 'react-router-dom'

require('./Tabs.css')

export default class Tabs extends React.Component {
  render () {
    return (
      <ul className='tabs'>
        <li><NavLink exact activeClassName='active' to='/'>Home</NavLink></li>
        <li><NavLink exact activeClassName='active' to='/scenes'>My Scenes</NavLink></li>
        <li><NavLink exact activeClassName='active' to='/scenes/new'>Create Scene</NavLink></li>
      </ul>
    )
  }
}
