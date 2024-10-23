const express = require('express')
const otherReport = require('./other_report')
const response = require('../../lib/newResponse')
const middle = require('../../lib/authMiddleware')
const router = express.Router()
const { authOtherSurveyor, authDashboard } = middle


router.get('/dashboard', async(req, res) => {
    req.body.query = req.query
    const result = await otherReport.getDashboard(req.body)
    return response(res, result.code, result.data)
})
router.get('/mobile', authOtherSurveyor, async(req, res) => {
    req.body.query = req.query
    req.body.OtherSurveyorId = req.OtherSurveyorId
    const result = await otherReport.getMobile(req.body)
    return response(res, result.code, result.data)
})
router.get('/getAllOtherReport', async(req, res) => {
    const result = await otherReport.getAllReport(req.body)
    return response(res, result.code, result.data)
})
router.get('/detailMobile/:id', authOtherSurveyor, async(req, res) => {
    req.body.query = req.query
    req.body.OtherSurveyorId = req.OtherSurveyorId
    req.body.otherReportId = req.params.id
    const result = await otherReport.getDetailMobile(req.body)
    return response(res, result.code, result.data)
})
router.post('/', authOtherSurveyor, async(req, res) => {
    req.body.OtherSurveyorId = req.OtherSurveyorId
    const result = await otherReport.create(req.body)
    return response(res, result.code, result.data)
})
router.put('/verifikasi/:id', async(req, res) => {
    req.body.otherReportId = req.params.id
    const result = await otherReport.verifikasi(req.body)
    return response(res, result.code, result.data)
})
router.put('/:id', async(req, res) => {
    req.body.otherReportId = req.params.id
    const result = await otherReport.edit(req.body)
    return response(res, result.code, result.data)
})
router.delete('/:id', async(req, res) => {
    req.body.otherReportId = req.params.id
    const result = await otherReport.delete(req.body)
    return response(res, result.code, result.data)
})

module.exports = router