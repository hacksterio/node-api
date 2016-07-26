const request = require('superagent');
const uuid = require('uuid');

function uploadToS3(s3, file) {
  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'public-read',
      Body: file.buffer,
      Bucket: process.env['AWS_BUCKET'],
      Key: `uploads/tmp/${uuid.v4()}/${file.originalname}`
    }, {}, (err, data) => {
      err ? reject("Error uploading to S3: " + err) : resolve(data);
    });
  });
}

function postURLToServer(url, req) {
  return new Promise((resolve, reject) => {
    request
      .post(`https://${process.env['HACKSTER_API_PATH']}/private/files`)
      .set('Authorization', `Bearer ${req.token}`)
      .set('Origin', req.get('origin'))
      .send({'file_url': url})
      .end((err, res) => {
        err ? reject('Error posting to server: ' + err) : resolve({id: res.body.id});
      });
  });
}

function uploadHandler(s3, req) {
  return new Promise((resolve, reject) => {
    return uploadToS3(s3, req.file)
      .then(data => {
        return process.env.NODE_ENV === 'development' && req.get('x-host') === 'localhost'
          ? Promise.resolve({url: data.Location})
          : postURLToServer(data.Location, req);
      })
      .then(urlOrId => resolve(urlOrId))
      .catch(err => reject(err));
  });
}

module.exports = uploadHandler;