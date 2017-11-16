import React from 'react'

require('./Header.css')

export default function Header () {
  return (
    <header className='navbar' role='navigation'>
      <div className='navbar-header'>
        <a href='/' className='navbar-logo'>
          <i className='pull-left icon icon-decentraland' />
          <h1 className='pull-left hidden-xs'>Decentraland</h1>
        </a>
      </div>

      <div id='navbar' className='navbar-container'>
        <ul className='nav navbar-nav navbar-right'>
          <li>
            <a href='https://decentraland.org/whitepaper.pdf'>Whitepaper</a>
          </li>

          <li>
            <a href='https://blog.decentraland.org' target='_blank'>Blog</a>
          </li>

          <li>
            <a href='https://chat.decentraland.org' className='rocketchat' target='_blank'>Chat</a>
          </li>
        </ul>
      </div>
    </header>
  )
}
