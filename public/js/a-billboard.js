/* globals AFRAME, MutationObserver */

var extendDeep = AFRAME.utils.extendDeep

// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin()

AFRAME.registerPrimitive('a-billboard', extendDeep({}, meshMixin, {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    geometry: {
      primitive: 'box'
    },

    material: {
      shader: 'html',
      target: '#html-element'
    },

    billboard: {
      active: true
    },

    shadow: {
      castShadow: true,
      recieveShadow: true
    }
  },

  // Defined mappings from HTML attributes to component properties (using dots as delimiters).
  // If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    depth: 'geometry.depth',
    height: 'geometry.height',
    width: 'geometry.width'
  }
}))

function randomId () {
  return `billboard-${Math.floor(Math.random() * 0xFFFFFFFFFF).toString(16)}`
}

// Registering component in foo-component.js
AFRAME.registerComponent('billboard', {
  schema: {},
  init: function () {
    if (!this.el) {
      console.log('Init with no el')
      return
    }

    // Add render target
    this.div = document.createElement('div')
    document.body.appendChild(this.div)
    this.div.style.cssText = 'width: 512px; height: 512px; position: fixed; left: 0; top: 0; z-index: -1; overflow: hidden; padding: 0;'

    // Set content in a div
    const content = document.createElement('div')
    content.innerHTML = this.el.innerHTML
    content.id = randomId()
    content.style.cssText = 'background: white; border: 1px solid white; width: 100%; height: 100%; color: black; font-family: sans-serif; font-size: 48px; margin: 0; padding: 0'
    this.div.appendChild(content)

    // Set the target element
    this.el.setAttribute('material', 'target', '#' + content.id)

    // Watch for updates
    this.observer = new MutationObserver(() => {
      content.innerHTML = this.el.innerHTML
      content.id = randomId()
      this.el.setAttribute('material', 'target', '#' + content.id)
    })

    // Watch the element
    var config = { childList: true, characterData: true }
    this.observer.observe(this.el, config)
  },
  update: () => {

  },
  tick: () => {

  },
  remove: function () {
    document.body.removeChild(this.div)
    this.observer.disconnect()
  },
  pause: () => {

  },
  play: () => {

  }
})

// Hide a-billboard content
const style = document.createElement('style')
style.innerHTML = 'a-billboard * { display: none }'
document.head.appendChild(style)
