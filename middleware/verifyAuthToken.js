var request = require('superagent');

function extractToken(req) {
  const header = req.get('Authorization');
  if(header) {
    return header.replace(/Bearer/, '').trim();
  } else {
    return req.query.access_token
     ? req.query.access_token
     : req.query.bearer_token
     ? req.query.bearer_token
     : req.body.token;
  }
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    request(`https://${process.env['HACKSTER_API_PATH']}/v2/authentications`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

function verifyAuthToken(req, res, next) {
  const token = extractToken(req);

  if(!token) return next();

  if(process.env.NODE_ENV === 'development' && req.get('x-host') === 'localhost') {
    req.token = token;
    return next();
  }

  verifyToken(token)
    .then(success => {
      req.token = token;
      next();
    })
    .catch(error => next(error));
}

module.exports = verifyAuthToken;