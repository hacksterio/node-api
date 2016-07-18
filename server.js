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

const request = require('superagent');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Beers!');
});

app.post('/files', upload.single('file'), (req, res, next) => {
  console.log("REQUEST", req.ip, req.hostname);
  // TODO: Handle size errors or any upload errors to respond with.
  // TODO: Check if theres no req.file and return and error with an expectation for a field of file.
  // TODO: Token can either be on the Authorization header or in the uri as a param.
  require('./uploadHandler')(s3, req.file, req.body)
    .then(urlOrId => res.json(urlOrId))
    .catch(err => res.status(400).json({ error: err }));
});

app.listen(8080);

