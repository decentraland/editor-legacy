const test = require('tape')
const Patch = require('../../vendor/patch')
const microdom = require('micro-dom')

// const GLOBALS = {
//   HTMLElement: microdom.HTMLElement,
//   MutationObserver: require('micro-dom').MutationObserver
// }

function createDocument (html) {
  const document = new microdom.Document()

  document.HTMLElement = microdom.HTMLElement
  document.MutationObserver = microdom.MutationObserver

  const scene = document.createElement('a-scene')
  if (html) {
    scene.innerHTML = html
  }
  document.body.appendChild(scene)

  return { document, scene }
}

test('#appendChild', (t) => {
  const { document, scene } = createDocument()

  Patch(document, scene, (message) => {
    t.ok(message.match(/<patch/))
    t.ok(message.match(/<a-cube data-uuid/))
    t.end()
  })

  scene.innerHTML = '<a-cube></a-cube>'
})

test('add some elements', (t) => {
  const { document, scene } = createDocument()

  Patch(document, scene, (message) => {
    t.ok(message.match(/<patch><a-scene/))
    t.ok(message.match(/<a-entity/))
    t.ok(message.match(/<a-cube/))
    t.end()
  })

  scene.innerHTML = '<a-entity><a-cube></a-cube></a-entity>'

  var div

  setTimeout(() => {
    div = document.createElement('div')
    scene.appendChild(div)
  }, 5)

  setTimeout(() => {
    var span = document.createElement('span')
    div.appendChild(span)
  }, 10)
})

test('remove an element', (t) => {
  const { document, scene } = createDocument('<a-box></a-box>')

  Patch(document, scene, (message) => {
    t.ok(message.match(/><a-box[^>]+data-dead/))
    t.end()
  })

  setTimeout(() => {
    scene.removeChild(scene.firstChild)
  }, 5)
})

test('add some text', (t) => {
  const { document, scene } = createDocument('<a-billboard></a-billboard>')

  var matchers = []

  Patch(document, scene, (message) => {
    // All patches should be to the billboard, we don't send patches to
    // subtrees that aren't <a-... /> elements
    t.ok(message.match(/<patch><a-billboard/))

    matchers.shift()(message)
  })

  matchers.push((message) => { t.ok(message.match(/i am a potato/)) })

  var billboard = document.querySelector('a-billboard')
  billboard.innerHTML = 'hi mum i am a potato'

  const b = document.createElement('blink')

  setTimeout(() => {
    matchers.push((message) => { t.ok(message.match(/i am a potato<blink/)) })

    b.innerHTML = 'flashing is cool'
    billboard.appendChild(b)
  }, 50)

  setTimeout(() => {
    matchers.push((message) => { t.ok(message.match(/<blink>zoop zoop/)) })

    b.innerHTML = 'zoop zoop'
    billboard.appendChild(b)
  }, 100)

  setTimeout(() => {
    matchers.push((message) => {
      t.ok(message.match(/wut wut/))
      t.end()
    })

    billboard.innerHTML = 'wut wut'
  }, 150)
})

/*

test('get full state', (t) => {
  var doc = createDocument()

  var p = new Patch(GLOBALS, doc.documentElement, (message) => {
  })
  doc.documentElement.innerHTML = '<body><a-scene><a-cube></a-cube></a-scene></body>'

  t.ok(p.getSnapshot().match(/<html/))
  t.end()
})


*/