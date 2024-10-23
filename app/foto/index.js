const express = require('express')
const foto = require('./foto.js')
const response = require('../../lib/newResponse')
const middle = require('../../lib/authMiddleware')
const router = express.Router()
const { authDashboard } = middle


router.get('/listKegiatan', async(req, res) => {
    req.body.query = req.query
    const result = await foto.listKegiatan(req.body)
    return response(res, result.code, result.data)
})
router.get('/listDaerah', async(req, res) => {
    req.body.query = req.query
    const result = await foto.listDaerah(req.body)
    return response(res, result.code, result.data)
})
router.get('/', async(req, res) => {
    req.body.query = req.query
    const result = await foto.get(req.body)
    return response(res, result.code, result.data)
})
// router.post('/', authDashboard, async(req, res) => {
//     req.body.RoleId = req.RoleId
//     const result = await foto.create(req.body)
//     return response(res, result.code, result.data)
// })
router.post('/', async(req, res) => {
    const result = await foto.create(req.body)
    return response(res, result.code, result.data)
})

module.exports = router