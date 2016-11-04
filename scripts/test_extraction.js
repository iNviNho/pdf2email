let { parseAll } = require('../lib/parse')
let extract = require('../lib/extract')

const path = require('path')
const fileDir = path.resolve(__dirname, '../files')
const outputDir = path.resolve(__dirname, '../output')
const debug = require('debug')('extraction')
const { inspect } = require('util')

console.log('what?')
debug(`triggered`)

parseAll({
  input: fileDir,
  output: outputDir,
  transform: (parsedFileName, parsedFileContent) => {
    let emails = extract.emails(parsedFileContent)

    debug(`extracted emails from ${parsedFileName}, here: ${inspect(emails)}`)
  } 
}, (errors) => {
  debug(`errors: ${inspect(errors)}`)
  process.exit(0)
})