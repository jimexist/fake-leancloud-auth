const _ = require('lodash')

function checkHeaders (headers) {
  return (req, res, next) => {
    for (const h of headers) {
      if (_.isEmpty(req.get(h))) {
        return res.status(401).json({
          code: 401,
          error: 'Unauthorized.'
        })
      }
      return next()
    }
  }
}

module.exports = {
  ensureAppHeaders: checkHeaders(['X-LC-Id', 'X-LC-Key'])
}
