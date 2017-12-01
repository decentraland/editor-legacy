/* globals THREE */

import React from 'react'
import ReactDOM from 'react-dom'

export default class PreviewParcels extends React.Component {
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
    const bounds = new THREE.Box2().setFromPoints(this.props.parcels)
    bounds.expandByScalar(1)

    const contains = (v) => {
      return !!(this.props.parcels.find((p) => p.equals(v)))
    }

    context.save()
    context.strokeStyle = 'white'
    context.setLineDash([1, 2])
    context.font = '12px sans-serif'
    context.textAlign = 'center'

    const offset = bounds.center()
    context.translate(128 - this.size / 2 + offset.x * -this.size, 128 - this.size / 2 + offset.y * -this.size)

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
