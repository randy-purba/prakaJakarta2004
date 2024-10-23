module.exports = {
    Ok: (res, data) => {
      res.status(200).json({
        statusCode: code,
        status: 'Success',
        data,
      })
    },
    Unauthorized: (res, data) => {
      res.status(401).json({
        statusCode: code,
        status: 'Failed',
        data,
      })
    },
    NotFound: (res, data) => {
      res.status(404).json({
        statusCode: code,
        status: 'Failed',
        data,
      })
    },
    Error: (res, data) => {
      res.status(500).json({
        statusCode: code,
        status: 'Error',
        message: 'Internal Server Error',
        data,
      })
    },
    BadRequest: (res, data) => {
      res.status(400).json({
        statusCode: code,
        status: 'Failed',
        data,
      })
    },
    Created: (res, data) => {
      res.status(201).json({
        statusCode: code,
        status: 'Success',
        data,
      })
    },
    Conflict: (res, data) => {
      res.status(409).json({
        statusCode: code,
        status: 'Failed',
        data,
      })
    },
    Forbidden: (res, data) => {
      res.status(403).json({
        statusCode: code,
        status: 'Failed',
        data,
      })
    },
  }
  