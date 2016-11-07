const fs = require('fs')
const debug = require('debug')('app/lib/parse')
const { inspect } = require('util')
const async = require('async')
const path = require('path')

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

const parseFile = (inputFilePath, outputFilePath, done) => { 
  const spawn = require('child_process').spawn
  const conversion = spawn('pdftotext', [inputFilePath, '-'])

  let content = ''

  conversion.stdout.on('data', (data) => {
    content += `${data}`
  })

  conversion.stderr.on('data', (errData) => {
    debug(`errData ${inspect(errData)}.`)
  })

  conversion.on('close', (code) => {
    debug(`conversion closed with code: ${code}`)
    if (outputFilePath) {
      fs.writeFile(outputFilePath, content, (errors) => done(errors, content))
    } else {
      return done(
        (code !== 0 ? new Error('Error converting.') : null), content
      )
    }
  })
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

        parseFileOS(filePath, outputFilePath, (errors, fileContent) => {
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