const handler = require('./handler')
const fs = require('fs')
const input = fs.readFileSync('./input.json', 'utf8')

const result = handler.handler(JSON.parse(input))

if (result instanceof Promise) {
    result.then((res) => {
        fs.writeFileSync('./result.json', JSON.stringify(res))
    })
}
else {
    fs.writeFileSync('./result.json', JSON.stringify(result))
}