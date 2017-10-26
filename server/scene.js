module.exports = class Scene {
  constructor (name) {
    this.name = name
    this.connections = []
  }

  add (c) {
    this.connections.push(c)
  }

  remove (c) {
    const idx = this.connections.indexOf(c)

    if (idx > -1) {
      this.connections.splice(idx, 1)
    }
  }
}
