const fetch = require('node-fetch')

function search (query) {
  const url = 'https://poly.google.com/_/VrZandriaUi/data'

  const headers = {
    'x-same-domain': '1',
    'origin': 'https://poly.google.com',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'accept': '*/*',
    'referer': 'https://poly.google.com/',
    'authority': 'poly.google.com'
  }

  const id = 157855946

  var body = 'f.req=' + escape(
    `[[[${id},[{"${id}":[30,null,null,[],null,null,null,[],"${query}", 1]}],null,null,0]]]`
  ) + '&'

  const method = 'POST'

  return fetch(url, {
    headers, body, method
  })
    .then((r) => r.text())
    .then((t) => {
      t = t.replace(/^[\s\S]+\[\[/, '[[')
      t = t.replace(/\]\n,\[null[\s\S]+$/, '')

      // console.log(t)

      var r

      try {
        r = JSON.parse(t)
      } catch (e) {
        const offset = parseInt(e.message.match(/(\d)+/)[0], 10)

        console.log(e.message)
        console.log(t.slice(offset, offset + 100) + '...')
      }

      const matches = r.map((response) => {
        return {
          id: response[0],
          name: response[1],
          description: response[2],
          image: response[3]
        }
      })

      return matches
    })
}

function download (id) {
  const url = `https://poly.google.com/view/${id}`

  return fetch(url)
    .then((r) => r.text())
    .then((t) => {
      return t.match(/(https:\/\/poly.google.com\/downloads\/.+?_obj.zip)/)[0]
    })
}

// search('rocket')
//   .then((models) => {
//     const model = models[0]
//     console.dir(model)
//     return download(models[0].id)
//   })
//   .then((url) => {
//     console.log(url)
//   })

module.exports = {
  search,
  download
}
