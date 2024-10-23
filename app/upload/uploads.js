const express = require('express')

const router = express.Router()
const Multer = require('multer')
const imgUpload = require('../../lib/imgUpload')

const multer = Multer({
  storage: Multer.MemoryStorage,
})

router.post('/multi',multer.array('file',10), imgUpload.uploadMulti, function(req, res, next) {
  res.status(200).json({
    status: true,
    message: 'OK',
    result: req.fileArr
  })
})

router.post('/single',multer.single('file'), imgUpload.uploadSingle, function(req, res, next) {
  res.status(200).json({
    status: true,
    message: 'OK',
    result: req.fileSingle
  })
})


module.exports = router;