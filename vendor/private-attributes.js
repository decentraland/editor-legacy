// fixme weakmap
var privateAttributes = new Map()

const UUID_KEY = 'data-uuid'

var cache = {}
cache[UUID_KEY] = new Map()

function setPrivateAttribute (element, name, value) {
  if (!privateAttributes.get(element)) {
    privateAttributes.set(element, {})
  }

  privateAttributes.get(element)[name] = value

  cache[name].set(value, element)
}

function getPrivateAttribute (element, name) {
  return privateAttributes.get(element) && privateAttributes.get(element)[name]
}

function hasPrivateAttribute (element, name) {
  return !!getPrivateAttribute(element, name)
}

function removePrivateAttribute (element, name) {
  if (privateAttributes.get(element)) {
    delete privateAttributes.get(element)[name]
  }
}

// Fixme keep a cache of attributes in another weakmap?
function queryPrivateAttribute (name, value) {
  return cache[name].get(value)
  //
  // for (var element of privateAttributes.keys()) {
  //   if (getPrivateAttribute(element, name) === value) {
  //     return element
  //   }
  // }

// return null
}

module.exports = {
  get: getPrivateAttribute,
  has: hasPrivateAttribute,
  set: setPrivateAttribute,
  query: queryPrivateAttribute,
  remove: removePrivateAttribute
}
