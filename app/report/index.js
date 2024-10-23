const express = require('express')
const report = require('./report')
const response = require('../../lib/newResponse')
const middle = require('../../lib/authMiddleware')
const router = express.Router()
var cors = require('cors')
const { authApp, authDashboard } = middle


router.get('/dashboard', authDashboard, async(req, res) => {
    req.body.query = req.query
    req.body.DashboardUserId = req.DashboardUserId
    const result = await report.getDashboard(req.body)
    return response(res, result.code, result.data)
})
router.get('/mobile', authApp, async(req, res) => {
    req.body.query = req.query
    req.body.AppUserId = req.AppUserId
    const result = await report.getMobile(req.body)
    return response(res, result.code, result.data)
})
router.get('/getAllReport', async(req, res) => {
    const result = await report.getAllReport(req.body)
    return response(res, result.code, result.data)
})
router.get('/getReportToday', async(req, res) => {
    const result = await report.getReportToday(req.body)
    return response(res, result.code, result.data)
})
router.get('/detailMobile/:id', authApp, async(req, res) => {
    req.body.query = req.query
    req.body.AppuserId = req.AppuserId
    req.body.reportId = req.params.id
    const result = await report.getDetailMobile(req.body)
    return response(res, result.code, result.data)
})
router.post('/', authApp, async(req, res) => {
    req.body.AppUserId = req.AppUserId
    const result = await report.create(req.body)
    return response(res, result.code, result.data)
})
router.put('/verifikasi/:id', async(req, res) => {
    req.body.reportId = req.params.id
    const result = await report.verifikasi(req.body)
    return response(res, result.code, result.data)
})
router.put('/:id', async(req, res) => {
    req.body.reportId = req.params.id
    const result = await report.edit(req.body)
    return response(res, result.code, result.data)
})
router.delete('/:id', async(req, res) => {
    req.body.reportId = req.params.id
    const result = await report.delete(req.body)
    return response(res, result.code, result.data)
})

module.exports = router