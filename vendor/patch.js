/*

  Todo:

    * Character data support
    * Merge multiple updates into one packet

*/

// var pa = require('./private-attributes')
const uuid = require('uuid')
const debounce = require('lodash.debounce')

const UUID_KEY = 'data-uuid'
const DEAD_NODE_NAME = 'dead'
const PATCH_NODE_NAME = 'patch'
const SNAPSHOT_NODE_NAME = 'snapshot'

function Patch (global, root, broadcast, filter) {
  var document = root.ownerDocument

  this.suppressed = new Set()

  function generateUUID () {
    return uuid.v4()
  }

  // todo - add uuid to textNodes
  function treeUUID (el, childNodes) {
    var nodes = [el]

    if (childNodes && el.nodeType === 1) {
      nodes = nodes.concat(Array.from(el.querySelectorAll('*')))
    }

    nodes.forEach((e) => {
      if (!e.getAttribute(UUID_KEY)) {
        e.setAttribute(UUID_KEY, generateUUID())
      }
    })

    return el.getAttribute(UUID_KEY)
  }

  this.getSnapshot = () => {
    var snapshot = document.createElement(SNAPSHOT_NODE_NAME)
    snapshot.appendChild(root.cloneNode(true))
    return snapshot.outerHTML
  }

  treeUUID(root, true)

  let debounced
  let patch = document.createElement(PATCH_NODE_NAME)
  let debouncedBroadcast = data => {
    if (debounced) {
      clearTimeout(debounced)
    }
    debounced = setTimeout(() => {
      debounced = null
      patch = document.createElement(PATCH_NODE_NAME)
      broadcast(data)
    }, 25)
  }

  // todo - merge all the mutations and send at the debounced rate, or maybe
  //    just remove the debounce altogether and spam each other? Dunno.
  const obs = (mutations) => {
    mutations.forEach((mutation) => {
      var uuid = treeUUID(mutation.target, true)

      if (this.suppressed.has(uuid)) {
        // nope
      } else {
        const clone = mutation.target.cloneNode(true)
        if (mutation.removedNodes.length) {
          mutation.removedNodes.forEach(removed => {
            if (!removed.nodeType === 1) {
              return
            }

            removed.setAttribute('data-dead', 'true')
            clone.appendChild(removed)
          })
        }
        patch.appendChild(clone)
      }
    })

    debouncedBroadcast(patch.outerHTML)
  }

  var observer = new global.MutationObserver(obs)
  var config = { attributes: true, subtree: true, childList: true, characterData: true }
  observer.observe(root, config)
}

module.exports = Patch
