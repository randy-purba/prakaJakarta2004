module.exports = (res, code, data) => {
  if (code === 200) {
    return res.status(200).json({
      statusCode: code,
      status: 'Success',
      data,
    })
  } else if (code === 202) {
    return res.status(202).json({
      statusCode: code,
      status: 'Success',
      data,
    })
  } else if (code === 500) {
    return res.status(500).json({
      status: 'Error',
      message: 'Internal Server Error',
      data,
    })
  } else if (code === 400) {
    return res.status(400).json({
      statusCode: code,
      status: 'Failed',
      data,
    })
  } else if (code === 403) {
    return res.status(403).json({
      statusCode: code,
      status: 'Failed',
      data,
    })
  } else if (code === 404) {
    return res.status(404).json({
      statusCode: code,
      status: 'Failed',
      data,
    })
  }
  return res.status(code).json({
    statusCode: code,
    status: 'Failed',
    data,
  })
}
