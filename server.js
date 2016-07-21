const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const s3 = new AWS.S3({ Bucket: 'hackster-dev' });

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const uuid = require('uuid');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({storage: storage, limits: { fileSize: 10*1024*1024 } });

const verifyAuthToken = require('./middleware/verifyAuthToken');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('Cheers!');
});

app.post('/v2/files', verifyAuthToken, upload.single('file'), (req, res, next) => {

  if(!req.token) {
    return res.status(401).send('Authorization Token is required in request!');
  }

  if(!req.file) {
    return res.status(400).send('A form data object with a file must be sent!');
  }

  require('./uploadHandler')(s3, req)
    .then(urlOrId => res.json(urlOrId))
    .catch(err => res.status(400).json({ error: err }));
});

app.listen(8080);
console.log("App listening on port 8080!");

