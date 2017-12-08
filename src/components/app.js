import 'babel-polyfill';

import React from 'react'
import ReactDOM from 'react-dom'
// import { Provider } from 'react-redux'
// import queryString from 'query-string'
import {
  BrowserRouter as Router,
  Route
  // Link
} from 'react-router-dom'

import './app.less'

// import { store } from './store'

import HomePage from './pages/HomePage'
import SceneList from './pages/SceneList'
import NewScene from './pages/new-scene'

// Gross
import * as three from 'three'
window.THREE = three

class ShowScene {

}

const App = () => {
  return (
    <Router>
      <div className='app'>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/scenes' component={SceneList} />
        <Route path='/scenes/new' component={NewScene} />
        <Route path='/scene/:ipfs' component={ShowScene} />
        <Route path='/scene/parcel' component={ShowScene} />
      </div>
    </Router>
  )
}

// const App = () => process.env.NODE_ENV === 'production' ? (
//   <Main />
// ) : (
//   <Provider store={store}>
//   </Provider>
// );

var div = document.createElement('section')
div.id = 'decentraland-editor'
document.body.appendChild(div)
ReactDOM.render(<App />, div)
