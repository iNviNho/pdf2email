const { isEmail } = require('validator')
const debug = require('debug')('app/lib/extract')

module.exports = {
  emails(text) {

    const rx = /[a-zA-Z0-9\.\-\_]*@[a-zA-Z0-9\.\-\_]*/gi
    
    let matches
    let results = []

    while (matches = rx.exec(text)) {
      let str = matches[0]

      debug('validating:', str)

      if (isEmail(str)) results.push(str)
    }

    return results
  } 
}