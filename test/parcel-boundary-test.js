import test from 'tape'
import ParcelBoundary from '../src/lib/parcel-boundary'
import * as THREE from 'three'

test('empty object3d', (t) => {
  const parcels = [new THREE.Vector2(0, 0)]
  const obj = new THREE.Object3D()

  const boundary = new ParcelBoundary(parcels, obj)

  t.ok(boundary instanceof ParcelBoundary)
  t.ok(boundary.validate())
  t.ok(boundary.invalidObjects instanceof Array)
  t.equal(boundary.invalidObjects.length, 0)
  t.end()
})

test('box in range', (t) => {
  const parcels = [new THREE.Vector2(0, 0)]
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(5, 5, 5)

  const boundary = new ParcelBoundary(parcels, mesh)

  t.ok(boundary.validate())
  t.end()
})

test('box out of range', (t) => {
  const parcels = [new THREE.Vector2(0, 0)]
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = -100

  const boundary = new ParcelBoundary(parcels, mesh)

  t.ok(!boundary.validate())
  t.equal(boundary.invalidObjects[0], mesh)
  t.end()
})

test('generate holes', (t) => {
  const parcels = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(0, 1)
  ]
  const boundary = new ParcelBoundary(parcels, new THREE.Object3D())
  t.equal(boundary.getHoles().length, 1)
  t.end()
})

test('no holes', (t) => {
  const parcels = [
    new THREE.Vector2(5, 5)
  ]
  const boundary = new ParcelBoundary(parcels, new THREE.Object3D())
  t.equal(boundary.getHoles().length, 0)
  t.end()
})

test('box in a hole', (t) => {
  const parcels = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(0, 1)
  ]
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(15, 0, 15)

  const boundary = new ParcelBoundary(parcels, mesh)

  t.ok(!boundary.validate())
  t.equal(boundary.invalidObjects[0], mesh)
  t.end()
})
