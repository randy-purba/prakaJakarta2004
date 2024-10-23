const express = require('express')
const dashboardUser = require('./dashboard_user.js')
const response = require('../../lib/newResponse')
const middle = require('../../lib/authMiddleware')
const router = express.Router()
const { authDashboard } = middle


router.get('/downloadKoordinator', authDashboard, async(req, res) => {
    req.body.RoleId = req.RoleId
    const result = await dashboardUser.downloadKoordinator(req.body)
    return response(res, result.code, result.data)
})
router.get('/wilayah', async(req, res) => {
    req.body.query = req.query
    const result = await dashboardUser.getWilayah(req.body)
    return response(res, result.code, result.data)
})
router.get('/kabupaten', async(req, res) => {
    req.body.query = req.query
    const result = await dashboardUser.getKabupaten(req.body)
    return response(res, result.code, result.data)
})
router.get('/dapil', async(req, res) => {
    req.body.query = req.query
    const result = await dashboardUser.getDapil(req.body)
    return response(res, result.code, result.data)
})
router.get('/listSurveyor', authDashboard, async(req, res) => {
    req.body.query = req.query
    req.body.DashboardUserId = req.DashboardUserId
    const result = await dashboardUser.listSurveyor(req.body)
    return response(res, result.code, result.data)
})
router.get('/listReport/:id', async(req, res) => {
    req.body.query = req.query
    req.body.AppUserId = req.params.id
    const result = await dashboardUser.listReport(req.body)
    return response(res, result.code, result.data)
})
router.get('/detailReport/:id', async(req, res) => {
    req.body.reportId = req.params.id
    const result = await dashboardUser.getDetailReport(req.body)
    return response(res, result.code, result.data)
})
router.get('/', async(req, res) => {
    req.body.query = req.query
    const result = await dashboardUser.get(req.body)
    return response(res, result.code, result.data)
})
// router.post('/', async(req, res) => {
//     const result = await dashboardUser.create(req.body)
//     return response(res, result.code, result.data)
// })
router.post('/', authDashboard, async(req, res) => {
    req.body.RoleId = req.RoleId
    const result = await dashboardUser.create(req.body)
    return response(res, result.code, result.data)
})
router.post('/login', async(req, res) => {
    const result = await dashboardUser.login(req.body)
    res.set({ authorization: `Bearer ${result.header}` })
    return response(res, result.code, result.data)
})
router.post('/logout', async(req, res) => {
    const result = await dashboardUser.logout(req.body)
    return response(res, result.code, result.data)
})
router.post('/cekStatus', async(req, res) => {
    const result = await dashboardUser.cekStatus(req.body)
    return response(res, result.code, result.data)
})
// router.put('/:id', async(req, res) => {
//     req.body.dashboardUserId = req.params.id
//     const result = await dashboardUser.edit(req.body)
//     return response(res, result.code, result.data)
// })
router.put('/:id', authDashboard, async(req, res) => {
    req.body.dashboardUserId = req.params.id
    req.body.RoleId = req.RoleId
    const result = await dashboardUser.edit(req.body)
    return response(res, result.code, result.data)
})
// router.delete('/:id', async(req, res) => {
//     req.body.dashboardUserId = req.params.id
//     const result = await dashboardUser.delete(req.body)
//     return response(res, result.code, result.data)
// })
router.delete('/:id', authDashboard, async(req, res) => {
    req.body.dashboardUserId = req.params.id
    req.body.RoleId = req.RoleId
    const result = await dashboardUser.delete(req.body)
    return response(res, result.code, result.data)
})

module.exports = router