const UUID_KEY = 'data-uuid'
const DEAD_NODE_NAME = 'dead'
const PATCH_NODE_NAME = 'patch'
const SNAPSHOT_NODE_NAME = 'snapshot'

function Apply (root, patcher) {
  var document = root.ownerDocument

  // The patcher will ignore updates
  function suppress (uuid) {
    patcher.suppressed.add(uuid)

    setTimeout(() => {
      patcher.suppressed.delete(uuid)
    }, 25)
  }

  function copyChildren (source, destination) {
    Array.from(source.childNodes).forEach((n) => {
      var clone

      if (n.nodeType === 1) {
        clone = document.createElement(n.nodeName)
        copyChildren(n, clone)

        // Apply attributes
        for (var i = 0; i < n.attributes.length; i++) {
          var attribute = n.attributes[i]
          clone.setAttribute(attribute.name, attribute.value)
        }
      } else {
        clone = document.importNode(n)
      }

      destination.appendChild(clone)
    })
  }

  function onSnapshot (snapshot) {
    root.innerHTML = ''

    copyChildren(snapshot.firstChild, root)

    var n = snapshot.firstChild

    // Apply attributes
    for (var i = 0; i < n.attributes.length; i++) {
      var attribute = n.attributes[i]
      root.setAttribute(attribute.name, attribute.value)
    }
  }

  function applyAttributes (target, source) {
    for (var i = 0; i < source.attributes.length; i++) {
      var attribute = source.attributes[i]

      // Don't trigger mutation events unnecessarily
      if (target.getAttribute(attribute.name) !== attribute.value) {
        target.setAttribute(attribute.name, attribute.value)
      }
    }
  }

  function onPatch (patch) {
    Array.from(patch.childNodes).forEach((n) => {
      var uuid = n.getAttribute(UUID_KEY)
      var target = root.querySelector(`[${UUID_KEY}='${uuid}']`)

      suppress(uuid)

      if (!target && root.getAttribute(UUID_KEY) === uuid) {
        target = root
      }

      if (!target) {
        throw new Error(`Unable to find target element with uuid '${uuid}' to patch`)
      }

      applyAttributes(target, n)

      console.log('wut')
      console.log(n)

      Array.from(n.childNodes).forEach((n) => {
        if (n.nodeName === '#text' || n.nodeName === '#comment') {
          return
        }
        var uuid = n.getAttribute(UUID_KEY)
        var child = root.querySelector(`[${UUID_KEY}='${uuid}']`)
        suppress(uuid)

        if (child && n.getAttribute('data-dead')) {
          target.removeChild(child)
        } else if (!child) {
          child = document.createElement(n.nodeName)
          target.appendChild(child)
          console.log('setting outerHTML')
          child.outerHTML = n.outerHTML
        } else {
          console.log('wut?')
          // Ignore duplicate element - this is cause when the snapshot
          // and diff are sent at the same time, it's sort of a shitty
          // situation but I'm not sure how to fix it nicely.
        }
      })
    })
  }

  this.onMessage = function (message) {
    if (message.nodeName.toLowerCase() === PATCH_NODE_NAME) {
      onPatch(message)
    } else if (message.nodeName.toLowerCase() === SNAPSHOT_NODE_NAME) {
      onSnapshot(message)
    } else {
      throw new Error(`Unknown message <${message.nodeName}/> in Apply#onMessage`)
    }

    // todo - return false if the message could not be applied (sync is broken)
    return true
  }
}

module.exports = Apply
