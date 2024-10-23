const { Storage } = require('@google-cloud/storage');
const Jimp = require('jimp')
const generateId = require('../lib/idGenerator')
const gcs = new Storage({
  projectId: 'praka_jakartadevelopment',
  keyFilename: "./praka_jakarta-development.json"
});

const bucketName = 'bucketdbayo'
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`
}

let fileUpload = {};
// var sizeOf = require('image-size');


fileUpload.uploadMulti = (req, res, next) => {
  if(!req.files || !req.files[0]){
    res.status(500).json({
      status: false,
      message: 'An error has occured, please try again.',
      result: []
    })
  }
  else{

    const arrFile = []
    // Can optionally add a path to the gcsname below by concatenating it before the filename
    req.files.map(
      function(data){
        const gcsname = generateId();
        const file = bucket.file(gcsname);

        const stream = file.createWriteStream({
          metadata: {
            contentType: data.mimetype
          }
        });

        stream.on('error', (err) => {
          req.file.cloudStorageError = err;
          res.status(500).json({
            status: false,
            message: 'An error has occured, please try again.',
            result: []
          })
        });

        stream.on('finish', () => {
          data.cloudStorageObject = gcsname;
          data.cloudStoragePublicUrl = getPublicUrl(gcsname);

        });
        arrFile.push(getPublicUrl(gcsname))

        stream.end(data.buffer);



      }
    )

      req.fileArr = arrFile      
      next()

  }
}

fileUpload.uploadSingle = (req, res, next) => {
  if(!req.file){
    res.status(500).json({
      status: false,
      message: 'An error has occured, please try again.',
      result: ""
    })
  }
  else{
    const gcsname = generateId()
    req.fileSingle = getPublicUrl(gcsname)

      const file = bucket.file(gcsname);
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        res.status(500).json({
          status: false,
          message: 'An error has occured, please try again.',
          result: ""
        })
      });

      stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname;
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);

      });
     stream.end(req.file.buffer);

    next();
  }

}

module.exports = fileUpload;