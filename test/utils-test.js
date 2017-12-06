import test from 'tape'
import utils from '../src/lib/utils'

test('createScene', (t) => {
  const element = document.createElement('a-entity')

  element.innerHTML = `
      <a-box></a-box>
      <a-sphere data-uuid='1234...'></a-sphere>
      <a-billboard>
        <div>hi friend you're <blink>cool</blink></div>
      </a-billboard>`

  const xml = utils.createScene(element)
  console.log(xml)

  // Returns string
  t.ok(xml)
  t.equal(typeof xml, 'string')

  // Check script tag doesn't self close
  t.ok(!xml.match(/<script[^>]+\/>/), 'no self closing script tags')
  t.ok(xml.match('</script>'))

  // Billboard
  t.ok(xml.match(/<div>hi friend/))

  // No xmlns
  t.ok(!xml.match(/xmlns/))

  // No data-uuid
  t.ok(!xml.match(/data-uuid/))

  t.end()
})
