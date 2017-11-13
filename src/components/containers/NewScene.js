/* globals THREE */

import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'

import Events from '../../lib/Events'
import Header from '../components/Header'
import Footer from '../components/Footer'

class PreviewParcels extends React.Component {
  componentDidMount () {
    var context = ReactDOM.findDOMNode(this).getContext('2d')
    this.paint(context)
  }

  componentDidUpdate () {
    var context = ReactDOM.findDOMNode(this).getContext('2d')
    context.clearRect(0, 0, 200, 200)
    this.paint(context)
  }

  get size () {
    return 48
  }

  paint (context) {
    const parcels = this.props.parcels.map((p) => new THREE.Vector2(p[0], p[1]))
    const bounds = new THREE.Box2().setFromPoints(parcels)
    bounds.expandByScalar(1)

    function contains (v) {
      return !!(parcels.find((p) => p.equals(v)))
    }

    context.save()
    context.strokeStyle = 'white'
    context.setLineDash([1, 2])
    context.font = '12px sans-serif'
    context.textAlign = 'center'

    const offset = bounds.center()
    context.translate(128 - this.size / 2 + offset.x * -this.size, 128 - this.size / 2 + offset.y * -this.size)
    //  - this.size / 2, offset.y - this.size / 2 + 128)

    var x, y
    for (x = bounds.min.x; x < bounds.max.x + 1; x++) {
      for (y = bounds.min.y; y < bounds.max.y + 1; y++) {
        const p = new THREE.Vector2(x, y)
        const v = p.clone().multiplyScalar(this.size)

        if (contains(p)) {
          context.fillStyle = 'black'
          context.fillRect(v.x, v.y, this.size, this.size)
          context.strokeRect(v.x, v.y, this.size, this.size)
          context.fillStyle = '#ccc'
          context.fillText(`${p.x},${p.y}`, v.x + this.size / 2, v.y + (this.size + 12) / 2)
        }
      }
    }

    context.restore()
  }

  render () {
    return <canvas style={{border: '1px solid #ccc'}} width={256} height={256} />
  }
}

export default class NewScene extends React.Component {
  constructor () {
    super(...arguments)
    this.state = {
      loading: true
    }
    this.dismiss = () => {
      Events.emit('savedismiss')
      this.setState({ loading: true })
    }
  }

  componentDidMount () {
  }

  render() {
    return <ReactModal isOpen style={
      {
        overlay: {
          zIndex: 10000
        },
        content: {
          background: '#2b2b2b',
          color: '#ccc'
        }
      }
    }>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <Header />
        <div>
          <h1>Create a scene for your {this.props.parcels.length} parcels</h1>

          <PreviewParcels parcels={this.props.parcels} />

          <p>
            <button>Start Creating</button>
          </p>
        </div>
        <Footer />
      </div>
    </ReactModal>
  }
}
