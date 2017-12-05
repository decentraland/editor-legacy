/* globals AFRAME, THREE */

var extendDeep = AFRAME.utils.extendDeep
var meshMixin = AFRAME.primitives.getMeshMixin()

AFRAME.registerPrimitive('a-parcel', extendDeep({}, meshMixin, {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    material: {
      color: '#ff00aa'
    },

    parcel: {
      parcels: '[[0,0]]'
      // L-shaped example: '[[0,0],[0,1],[1,1]]'
    },

    shadow: {
      receive: true
    }
  },

  // Defined mappings from HTML attributes to component properties (using dots as delimiters).
  // If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    parcels: 'parcel.parcels'
  }
}))

// var debug = AFRAME.utils.debug

// var error = debug('aframe-text-component:error');

// var fontLoader = new THREE.FontLoader();

function generateGeometry (parceldata) {
  // Get the bounds of the parcel
  const parcels = JSON.parse(parceldata).map((p) => new THREE.Vector2(p[0], p[1]))
  const bounds = new THREE.Box2().setFromPoints(parcels)

  // Create a 1 parcel buffer
  bounds.expandByScalar(1)

  function contains (v) {
    return !!(parcels.find((p) => p.equals(v)))
  }

  const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01)

  function mergeBox (location, scale) {
    const mesh = new THREE.Mesh()
    mesh.position.copy(location)
    mesh.geometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z)
    mesh.updateMatrix()
    geometry.merge(mesh.geometry, mesh.matrix)
  }

  var x, y

  const thickness = 0.2

  // Add x direction borders
  for (x = bounds.min.x; x < bounds.max.x + 1; x++) {
    for (y = bounds.min.y; y < bounds.max.y + 1; y++) {
      const p = new THREE.Vector2(x, y)

      const pAcross = p.clone()
      pAcross.x += 1

      const pAbove = p.clone()
      pAbove.y += 1

      // add border on right
      if (contains(p) && !contains(pAcross)) {
        mergeBox(new THREE.Vector3(p.x * 10 + 5, 0, p.y * 10), new THREE.Vector3(thickness, thickness, 10 + thickness))
      } else if (!contains(p) && contains(pAcross)) {
        mergeBox(new THREE.Vector3(p.x * 10 + 5, 0, p.y * 10), new THREE.Vector3(thickness, thickness, 10 + thickness))
      }

      // add border on bottom
      if (contains(p) && !contains(pAbove)) {
        mergeBox(new THREE.Vector3(p.x * 10, 0, p.y * 10 + 5), new THREE.Vector3(10 + thickness, thickness, thickness))
      } else if (!contains(p) && contains(pAbove)) {
        mergeBox(new THREE.Vector3(p.x * 10, 0, p.y * 10 + 5), new THREE.Vector3(10 + thickness, thickness, thickness))
      }
    }
  }

  return geometry
}

AFRAME.registerComponent('parcel', {
  schema: {
    parcels: {type: 'string', default: ''}
  },

  update: function (oldData) {
    var el = this.el
    var mesh = el.getOrCreateObject3D('mesh', THREE.Mesh)
    mesh.geometry = generateGeometry(this.data.parcels)
  }
})
