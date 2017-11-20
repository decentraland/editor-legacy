/* globals localStorage */

const RECENT_SCENES = 'recent-scenes'

class Store {
  get scenes () {
    var result = []

    try {
      result = JSON.parse(localStorage.getItem(RECENT_SCENES) || [])
    } catch (e) {
      // Clear localStorage if it has corrupt data
      // localStorage.clearItem(RECENT_SCENES)
    }

    return new Set(result)
  }

  addScene (name) {
    this.saveScenes(this.scenes.add(name))
  }

  saveScenes (scenes) {
    localStorage.setItem(RECENT_SCENES, JSON.stringify(Array.from(scenes)))
  }
}

// Singleton
const store = new Store()

export default store
