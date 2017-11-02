
/* Apply */

/*

test('add some text', (t) => {
  t.plan(4)

  var doc = createDocument('<body><a-scene><a-cube></a-cube></a-scene></body>')
  var slave = createDocument()
  var apply = new Apply(slave.documentElement)

  var patch = new Patch(GLOBALS, doc.documentElement, (message) => {
    var patch = parseMessage(message)
    t.equal('PATCH', patch.nodeName)
    t.ok(apply.onMessage(patch))
  })

  apply.onMessage(parseMessage(patch.getSnapshot()))

  var cube = doc.querySelector('a-cube')
  cube.setAttribute('position', '1 2 3')

  setTimeout(() => {
    var cube = slave.querySelector('a-cube')
    t.ok(cube)
    t.equal('1 2 3', cube.getAttribute('position'))
  }, 10)
})

test('add two elements', (t) => {
  t.plan(8)

  var doc = createDocument('<body><a-scene><a-entity id="avatars"></a-entity></a-scene></body>')
  var slave = createDocument()
  var apply = new Apply(slave.documentElement)

  var patch = new Patch(GLOBALS, doc.documentElement, (message) => {
    var patch = parseMessage(message)
    t.equal('PATCH', patch.nodeName)
    t.ok(apply.onMessage(patch), 'apply patch')
  })

  apply.onMessage(parseMessage(patch.getSnapshot()))

  const avatars = doc.querySelector('#avatars')

  const a = doc.createElement('a-avatar')
  avatars.appendChild(a)

  setTimeout(() => {
    const b = doc.createElement('a-avatar')
    avatars.appendChild(b)
  }, 10)

  setTimeout(() => {
    var avatars = slave.querySelector('#avatars')
    t.ok(avatars)
    t.equal(2, avatars.childNodes.length)
    t.equal('A-AVATAR', avatars.firstChild.nodeName)
    t.equal('A-AVATAR', avatars.lastChild.nodeName)
  }, 20)
})

*/