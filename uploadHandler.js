const request = require('superagent');
const uuid = require('uuid');

const localhost = 'http://api.localhost.local:5000';

function uploadToS3(s3, file) {
  console.log("UPLOADING TO S3!");
  return new Promise((resolve, reject) => {
    s3.upload({
      ACL: 'public-read',
      Body: file.buffer,
      Bucket: 'hackster-dev',
      Key: `uploads/tmp/${uuid.v4()}/${file.originalname}`
    }, {}, (err, data) => {
      err ? reject("UPLOAD TO S3: " + err) : resolve(data);
    });
  });
}

function postURLToServer(url, apiPath, token, projectID, modelType, fileType) {
  console.log("POSTING TO SERVER! ", url);
  return new Promise((resolve, reject) => {
    request
      .post(`${apiPath}/private/files`)
      .set('Authorization', `Bearer ${token}`)
      .set('Origin', 'http://localhost:8080')
      .send({
        'file_url': url,
        'file_type': fileType || 'image',
        'attachable_id': projectID,
        'attachable_type': modelType
      })
      .end(function(err, res) {
        console.log("POST TO SERVER ERROR: ", err);
        err ? reject('POST TO SERVER: ' + err) : resolve({id: res.body.id});
      });
  });
}

function uploadHandler(s3, file, body) {
  return new Promise((resolve, reject) => {
    return uploadToS3(s3, file)
      .then(data => {
        console.log("IS API LOCALHOST? ", body.apiPath);
        return body.apiPath === localhost
          ? Promise.resolve({url: data.Location})
          : postURLToServer(data.Location, body.apiPath, body.token, body.projectID, body.modelType, 'image')
      })
      .then(urlOrId => resolve(urlOrId))
      .catch(err => reject(err));
  });
}

module.exports = uploadHandler;