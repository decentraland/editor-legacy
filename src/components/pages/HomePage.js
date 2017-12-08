import React from 'react'
import Header from './header'
import Tabs from './tabs'

require('./HomePage.css')

export default class HomePage extends React.Component {
  render () {
    return (
      <div className='home-page overlay'>
        <Header />
        <Tabs />

        <div className='container-fluid white-bkg text-center hero'>
          <div className='row'>
            <div className='col-xs-12'>
              <img src='./img/laptop.png' className='img-responsive' alt='Parcel editor in laptop' width='575' />
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12'>
              <div className='main-text'>
                <h1 className='title'>Parcel Editor</h1>
                <p className='subtitle'>Edit your prototypes for Decentraland's world, in real-time.</p>

                <form id='js-choose-scene' className='choose-scene' method='GET' action='/scene'>
                  <input type='text' name='scene-name' required='required' placeholder='Scene name' />
                  <input type='submit' value='Get Started' />
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className='container-fluid key-points gray-bkg'>
          <div className='row key-point'>
            <div className='col-xs-12 text-center'>
              <h3>Open Standards</h3>
              <p>Based on open technologies</p>
              <a href='https://github.com/decentraland/editor' className='btn btn-primary'>See code</a>
            </div>
          </div>
          <div className='row key-point'>
            <div className='col-xs-12 text-center'>
              <h3>Real Time Editing</h3>
              <p>Decentralized communications through WebRTC are used to apply changes in real time, and chat through voice and text while creating the scene.</p>
              <a href='https://chat.decentraland.org' className='btn btn-primary'>Find a Team</a>
            </div>
          </div>
          <div className='row key-point'>
            <div className='col-xs-12 text-center'>
              <h3>Upload and Resume on IPFS</h3>
              <p>Store your work on the permanent web, and resume working on it later.</p>
              <a href='/scene/decentraland' className='btn btn-primary'>Load sample scene</a>
            </div>
          </div>
        </div>

        <footer className='container-fluid white-bkg'>
          <div className='row'>
            <div className='col-xs-12 col-md-4 text-center'>
              <b>Decentraland Foundation</b>
            </div>
            <div className='col-xs-12 col-md-4 useful-links text-center'>
              <a href='https://blog.decentraland.org'>Blog</a>
              <a href='https://decentraland.org#faqs'>FAQs</a>
              <a href='mailto:hello@decentraland.org'>Get in touch</a>
            </div>
            <div className='col-xs-12 col-md-4 text-center'>
              <div className='social-icons'>
                <a className='icon social-icon-twitter' href='https://twitter.com/decentraland' target='_blank' />
                <a className='icon social-icon-chat' href='https://chat.decentraland.org' target='_blank' />
                <a className='icon social-icon-github' href='https://github.com/decentraland' target='_blank' />
                <a className='icon social-icon-forum' href='https://forum.decentraland.org' target='_blank' />
                <a className='icon social-icon-reddit' href='https://reddit.com/r/decentraland' target='_blank' />
                <a className='icon social-icon-facebook' href='https://www.facebook.com/decentraland/' target='_blank' />
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 copyright text-center'>
              <span>Copyright 2017 Decentraland. All rights reserved</span>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}
