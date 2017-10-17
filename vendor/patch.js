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

  this.getSnapshot = function () {
    var snapshot = document.createElement(SNAPSHOT_NODE_NAME)
    snapshot.appendChild(root.cloneNode(true))
    return snapshot.outerHTML
  }

  treeUUID(root, true)

  const debouncedObserver = debounce((mutations) => {
    var patch = document.createElement(PATCH_NODE_NAME)

    mutations.forEach(function (mutation) {
      treeUUID(mutation.target, true)

      console.log(mutation)

      // var uuid = mutation.target.getAttribute(UUID_KEY)
      // var el

      // if (mutation.type === 'attributes' && attributeMutations[uuid]) {
      //   el = attributeMutations[uuid]
      // } else {

      patch.appendChild(mutation.target.cloneNode(true))
    })

    broadcast(patch.outerHTML)
  }, 25)

  var observer = new global.MutationObserver(debouncedObserver)
  var config = { attributes: true, subtree: true, childList: true, characterData: true }
  observer.observe(root, config)
}

module.exports = Patch
