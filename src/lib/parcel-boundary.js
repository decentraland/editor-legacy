/* globals THREE */

// import * as THREE from 'three'
import assert from 'assert'

/*

  ParcelBoundary

  We use this class to work out whether the specified object3D (and all
  it's children are contained within the parcel array supplied).

  The technique used it to generate a AABB around all the parcels, then
  test that the object3D fits inside the AABB.

  If that test passes, we then iterate over the leaf nodes of the object3D
  and check that the object3D does not collide with any of the 'holes'
  in the parcel boundary.

  We are only doing a 2 dimensional test (x and z dimensions)

  Notes:

    * This will fail for an object which is L shaped in such a way
      that the bounds of the object intersect with a hole, but the
      mesh of the object does not actually leave the boundary.

    * May want to replace this with a per face test later, but that
      may be super expensive to do on animated objects / large
      meshes.

*/

// We allow this height in both -y and +y
const HEIGHT = 1024

// Parcel size in x and z dimensions
const PARCEL_SIZE = 10

export default class ParcelBoundary {
  constructor (parcels, object3D) {
    assert(parcels instanceof Array)
    assert(parcels.length > 0)
    assert(parcels[0] instanceof THREE.Vector2)
    this.parcels = parcels

    assert(object3D instanceof THREE.Object3D)
    this.object3D = object3D
  }

  getBounds () {
    return new THREE.Box2().setFromPoints(this.parcels)
  }

  getWorldBounds () {
    const b = this.getBounds()

    return (
      new THREE.Box3(
        new THREE.Vector3(b.min.x * PARCEL_SIZE, -HEIGHT, b.min.y * PARCEL_SIZE),
        new THREE.Vector3(
          (b.max.x + 1) * PARCEL_SIZE, HEIGHT, (b.max.y + 1) * PARCEL_SIZE)
      )
    )
  }

  // Returns world-space AABB of holes in the bounds
  getHoles () {
    const b = this.getBounds()
    const result = []

    for (let x = b.min.x; x < b.max.x + 1; x++) {
      for (let y = b.min.y; y < b.max.y + 1; y++) {
        const v = new THREE.Vector2(x, y)

        if (this.parcels.find(p => p.equals(v))) {
          // parcel exists, not a hole
        } else {
          result.push(
            new THREE.Box3(
              new THREE.Vector3(b.min.x * PARCEL_SIZE, -HEIGHT, b.min.z * PARCEL_SIZE),
              new THREE.Vector3(b.max.x * PARCEL_SIZE, HEIGHT, b.max.z * PARCEL_SIZE)
            )
          )
        }
      }
    }

    return result
  }

  validate () {
    const bounds = this.getWorldBounds()
    const holes = this.getHoles()

    this.invalidObjects = []

    this.object3D.traverse((obj) => {
      if (obj.children.length > 0) {
        // Only process leaf nodes
        return
      }

      let valid = true
      let bbox = new THREE.Box3().setFromObject(obj)

      // Must be in bounds
      if (!bounds.containsBox(bbox)) {
        console.log('does not contain')
        console.dir(bounds)
        console.dir(bbox)
        valid = false
      }

      // Must not intersect with any holes
      holes.forEach((hole) => {
        if (bounds.intersect(hole)) {
          valid = false
        }
      })

      if (!valid) {
        this.invalidObjects.push(obj)
      }
    })

    return this.invalidObjects.length === 0
  }
}
