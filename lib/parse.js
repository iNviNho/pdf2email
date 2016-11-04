const fs = require('fs')
const pdf2json = require('pdf2json')
const debug = require('debug')('app/lib/parse')
const { inspect } = require('util')
const { each } = require('underscore')
const async = require('async')
const path = require('path')

const errEvent = 'pdfParser_dataError'
const readyEvent = 'pdfParser_dataReady'

const getFilesToParse = (directory, done) => {
  fs.readdir(directory, (errors, files) => {
    if (errors) {
      throw errors
    } else {
      debug(`getFilesToParse files: ${inspect(files)}`)
      return done(errors, files)
    }
  })
}

const cleanTextValue = (text) => {
  return unescape(text).trim()
}

const cleanJSONValues = (json) => {
  let content = ''

  each(json, (val, key) => {
    if (typeof val === 'object') {
      content += cleanJSONValues(val) 
    } else if (typeof val === 'string' && val.length > 1) {
      content += ('\n' + cleanTextValue(val))
    } else {
      // debug(`json value is not text/object: ${inspect(val)}`)
    }
  })

  return content
}

const parseFile = (inputFilePath, ouputFilePath, done) => {
  let parser = new pdf2json()

  parser.on(errEvent, errData => {
    debug(`parseFile errData: ${inspect(errData)}`)
    return done(errData)
  })

  parser.on(readyEvent, pdfData => {
    // debug(`pdfData: ${inspect(pdfData)}`)
    let content = cleanJSONValues(pdfData)

    if (ouputFilePath) {
      fs.writeFile(
        ouputFilePath, content, 
      (errors) => done(errors, content))
    } else {
      return done(null, content)
    }
    
  })

  parser.loadPDF(inputFilePath)
}

function parseAll({ input, output='/tmp', transform }, done) {
  debug(`parse input: ${input}, output: ${output}.`)
  getFilesToParse(input, (errors, files) => {
    async.eachSeries(files, (fileName, next) => {
      const extension = path.extname(fileName)
      if (extension && extension.toLowerCase() === '.pdf') {
        const filePath = path.resolve(input, fileName)
        const outputFilePath = path.resolve(
          output, `${path.basename(fileName, extension)}.txt`
        )

        parseFile(filePath, outputFilePath, (errors, fileContent) => {
          if (typeof transform === 'function') {
            transform(outputFilePath, fileContent)
          }
          return next(errors)
        })
      } else {
        debug(`file not a pdf: ${fileName}`)
        return next()
      }
    }, done)
  })
}

module.exports = {
  parseFile,
  parseAll
}