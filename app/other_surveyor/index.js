const express = require('express')
const otherSurveyor = require('./other_surveyor')
const response = require('../../lib/newResponse')
const middle = require('../../lib/authMiddleware')
const router = express.Router()
const { authDashboard } = middle

router.get('/', async(req, res) => {
    req.body.query = req.query
    const result = await otherSurveyor.get(req.body)
    return response(res, result.code, result.data)
})
router.get('/getAllUser', async(req, res) => {
    const result = await otherSurveyor.getAllUser(req.body)
    return response(res, result.code, result.data)
})
router.post('/', authDashboard, async(req, res) => {
    req.body.RoleId = req.RoleId
    const result = await otherSurveyor.create(req.body)
    return response(res, result.code, result.data)
})
router.post('/login', async(req, res) => {
    const result = await otherSurveyor.login(req.body)
    res.set({ authorization: `Bearer ${result.header}` })
    return response(res, result.code, result.data)
})
router.post('/logout', async(req, res) => {
    const result = await otherSurveyor.logout(req.body)
    return response(res, result.code, result.data)
})
router.post('/cekStatus', async(req, res) => {
    const result = await otherSurveyor.cekStatus(req.body)
    return response(res, result.code, result.data)
})
router.put('/:id', async(req, res) => {
    req.body.OtherSurveyorId = req.params.id
    const result = await otherSurveyor.edit(req.body)
    return response(res, result.code, result.data)
})
router.delete('/:id', async(req, res) => {
    req.body.OtherSurveyorId = req.params.id
    const result = await otherSurveyor.delete(req.body)
    return response(res, result.code, result.data)
})

module.exports = router