const bodyParser = require('body-parser')
const express = require('express')
const config = require('./config/application')
const { parseFile } = require('./lib/parse')
const extract = require('./lib/extract')

const debug = require('debug')('app/')
const { inspect } = require('util')
const path = require('path')
const multer  = require('multer')

let app = express()
let upload = multer({
  dest: path.resolve(__dirname, 'files')
})

app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  res.render('upload')
})

app.post('/upload', upload.single('input_file'), (req, res) => {
  debug(`FILE RECEIVED: ${inspect(req.file)}`)
  const { path: filePath } = req.file

  parseFile(filePath, null, (errors, textContent) => {
    if (errors) {
      res.status(500).send('Error parsing the file provided!')
    } else {
      res.render('result', { emails: extract.emails(textContent) })
    }
  })

  
})

app.listen(config.port, () => debug(`listening on ${config.port}`))