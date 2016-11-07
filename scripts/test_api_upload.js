const request = require('request')
const config = require('../config/application')
const debug = require('debug')('app/scripts/test_api')
const { inspect } = require('util')
const { createReadStream } = require('fs')
const { resolve } = require('path')

const inputFilePath = resolve(__dirname, '../files/', 'test_input_file.pdf')
const formData = {
  // Pass a simple key-value pair
  client_name: 'client_name',
  input_file: createReadStream(inputFilePath)
}

request.post({
  url: `http://localhost:${config.port}/api/upload`, formData 
}, (error, httpResponse, body) => {
  debug(
    `request responded with error: ${inspect(error)}, body: ${inspect(body)}`
  )
  if (error) {
    process.exit(2)
  } else {
    process.exit(0)
  }
})