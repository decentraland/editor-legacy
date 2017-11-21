/* globals XMLSerializer */

/*

  Todo:

    * Character data support
    * Merge multiple updates into one packet

*/

// var pa = require('./private-attributes')
const uuid = require('uuid')
const debounce = require('lodash.debounce')

const UUID_KEY = 'data-uuid'
// const DEAD_NODE_NAME = 'dead'
const PATCH_NODE_NAME = 'patch'
const SNAPSHOT_NODE_NAME = 'snapshot'

function isAframeEntity (node) {
  return node.nodeName.toLowerCase().slice(0, 2) === 'a-'
}

function Patch (global, root, broadcast) {
  var document = root.ownerDocument

  // Elements that we just recieved updates for, so when the mutation observer
  // fires, we don't resend them.
  this.suppressed = new Set()

  function generateUUID () {
    return uuid.v4()
  }

  function treeUUID (el, childNodes) {
    var nodes = [el]

    if (childNodes && el.nodeType === 1) {
      nodes = nodes.concat(Array.from(el.querySelectorAll('*')))
    }

    // We only add tree IDs to aframe <a-.. /> elements
    nodes = nodes.filter((node) => isAframeEntity(node))

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

  // todo - use lodash.debounce
  let debounced
  let patch = document.createElement(PATCH_NODE_NAME)

  // const parser = new DOMParser()
  // const patchDocument = parser.parseFromString(`<${PATCH_NODE_NAME} />`, 'text/xml')

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
        var target = mutation.target

        while (!isAframeEntity(target)) {
          target = target.parentNode
        }

        const clone = target.cloneNode(true)

        if (mutation.removedNodes.length) {
          mutation.removedNodes.forEach(removed => {
            if (removed.nodeType !== 1) {
              return
            } else if (!isAframeEntity(removed)) {
              return
            }

            removed.setAttribute('data-dead', 'true')
            clone.appendChild(removed)
          })
        }

        patch.appendChild(clone)
      }
    })

    var xml = new XMLSerializer().serializeToString(patch)

    // Fix me this is a terrible hack, need to work out how to use xmlserializer properly
    xml = xml.replace(/\s*xmlns=".+?"/g, '')

    debouncedBroadcast(xml)
  }

  var observer = new global.MutationObserver(obs)
  var config = { attributes: true, subtree: true, childList: true, characterData: true }
  observer.observe(root, config)
}

module.exports = Patch
