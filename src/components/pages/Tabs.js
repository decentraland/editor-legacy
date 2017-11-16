import React from 'react'
import { Link } from 'react-router-dom'

require('./Tabs.css')

export default function Tabs () {
  return (
    <ul className='tabs'>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/scenes'>My Scenes</Link></li>
      <li><Link to='/scenes/new'>Create Scene</Link></li>
    </ul>
  )
}
