const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')
const nodeGeocoder = require('../../lib/geocoder')
const date = require('date-and-time');
const moment = require('moment')

const { Report, DashboardUser, AppUser, sequelize, Wilayah } = models

module.exports = {
    getAllReport: async (reportObj) => {
        try {
            let queries = `SELECT COUNT(*) AS data FROM praka_jakartadb.Reports`
            let reports = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )
            return { code: 200, data: reports[0].data }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getReportToday: async (reportObj) => {
        try {
            let queries = `SELECT COUNT(*) AS data FROM praka_jakartadb.Reports WHERE createdAt >= CURDATE()`
            let reports = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )

            return { code: 200, data: reports[0].data }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getMobile: async (reportObj) => {
        try {
            const { query, AppUserId } = reportObj
            const { limit, sortby, order, afterId, filterbydate } = query
            const lim = limit ? Number(limit) : 10
            const app = await AppUser.findByPk(AppUserId)
            let sequelizeQuery = {
                where: { 
                    AppUserId: app.id 
                },
                order: [[sortby || 'id', order || 'DESC']],
                limit: lim
            }
            if(lim == 'all'){
                delete sequelizeQuery.limit
            }
            if (afterId) {
                sequelizeQuery.where = {
                    id : { $lt: afterId },
                }
                if(order=='ASC'){
                    sequelizeQuery.where.id = { $gt: afterId }
                } 
            }
            
            if (filterbydate) {
                if(filterbydate === 'Day') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('day'),
                        $lt: moment().endOf('day')
                    } } )
                } else if (filterbydate === 'Week') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('week'),
                        $lt: moment().endOf('week')
                    } } )
                } else if (filterbydate === 'Month') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('month'),
                        $lt: moment().endOf('month')
                    } } )
                }
            }
            const reports = await Report.findAndCountAll(sequelizeQuery)
            const result = { count: reports.count, page: Math.ceil(reports.count / lim), rows: reports.rows }
            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getDetailMobile: async (reportObj) => {
        try {
            const { AppuserId, reportId } = reportObj
            const report = await Report.findByPk(reportId)
            if(!report) {
                return { code: 401, data: "Invalid Report Id" }
            }
            return { code:200, data: report }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getDashboard: async (reportObj) => {
        try {
            const { query, DashboardUserId } = reportObj
            const { limit, sortby, page, order, filterbydate, filterbysurveyor, searchbykelurahan,
                    searchbykecamatan, searchbykabupaten, searchbyprovinsi, filterbywilayah,
                    filterbykabupaten, filterbydapil, filterbykoordinator 
                } = query
            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            
            let sequelizeQuery = {
                include: [
                    { model: AppUser, include: [{ model: DashboardUser }] }
                ], 
                where: { },
                order: [[sortby || 'id', order || 'DESC']],
                limit: lim
            }
            if(pageNum > 1) {
                sequelizeQuery.limit = [(pageNum-1) * lim || 0, lim] 
            }
            if(lim == 'all'){
                delete sequelizeQuery.limit
            }

            const dashboardUser = await DashboardUser.findByPk(DashboardUserId)
            if(dashboardUser.RoleId != 'jmkt41ot') {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$AppUser.CoordinatorId$': { $eq: dashboardUser.id } } )
            }

            if (filterbydate) {
                if(filterbydate === 'Day') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('day'),
                        $lt: moment().endOf('day')
                    } } )
                } else if (filterbydate === 'Week') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('week'),
                        $lt: moment().endOf('week')
                    } } )
                } else if (filterbydate === 'Month') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        $gt: moment().startOf('month'),
                        $lt: moment().endOf('month')
                    } } )
                }
            }

            if(filterbysurveyor){
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { AppUserId: filterbysurveyor } )
            }

            if(searchbykelurahan) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { kelurahan: { $like: `%${searchbykelurahan}%` } } )
              }
            if(searchbykecamatan) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { kecamatan: { $like: `%${searchbykecamatan}%` } } )
            }
            if(searchbykabupaten) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { kabupaten: { $like: `%${searchbykabupaten}%` } } )
            }
            if(searchbyprovinsi) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { provinsi: { $like: `%${searchbyprovinsi}%` } } )
            }

            if(filterbykoordinator) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$AppUser.CoordinatorId$': filterbykoordinator } )
            }

            if(filterbywilayah) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$AppUser.DashboardUser.WilayahId$': filterbywilayah } )
            }
            if(filterbykabupaten) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$AppUser.DashboardUser.KabupatenId$': filterbykabupaten } )
            }
            if(filterbydapil) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$AppUser.DashboardUser.DapilId$': filterbydapil } )
            }

            const reports = await Report.findAndCountAll(sequelizeQuery)

            const result = { count: reports.count, page: Math.ceil(reports.count / lim), rows: [] }
            let reportProcess = await reports.rows.map(async (report) => {
                let reportObj = await getReportDetail(report.id, report)
                await result.rows.push(reportObj)
            })
            await Promise.all(reportProcess)

            return { code: 200, data: Object.assign(result, { page: Math.ceil(result.count / lim) || 1 }) }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    create: async (reportObj) => {
        try {
            const {
                AppUserId, name, address1, pekerjaan, usia, jenisKelamin, lat, lng, images, answer1, answer2
            } = reportObj 

            if (!name || !lat || !lng || !images || !answer1 || !answer2 || !address1 || !pekerjaan || !usia || !jenisKelamin) {
                return { code: 400, data: "Required field must be filled" }
            }
            const app = await AppUser.findOne({
                where: {
                    id: AppUserId
                },
                include: [
                    { model: DashboardUser, include: [ { model: Wilayah } ] }
                ]
            })

            const totalReport = await Report.findAndCountAll({
                where: {
                    AppuserId: app.id,
                    createdAt: {
                        $gt: moment().startOf('day'),
                        $lt: moment().endOf('day')
                    }
                }
            })
            
            if(totalReport.rows.length > 0 && app.DashboardUser.Wilayah.name == 'Bogor') {
                return { code: 500, data: "Anda tidak dapat membuat report lagi." }
            }

            if(totalReport.rows.length >= 20 && app.DashboardUser.Wilayah.name == 'Sukabumi') {
                return { code: 500, data: "You can make report 20 per day" }
            }

            if(totalReport.rows.length >= 10 && app.DashboardUser.Wilayah.name == 'Matraman') {
                return { code: 500, data: "You can make report 10 per day" }
            }

            const id = generatedId()
            const dataGeo = await nodeGeocoder.reverse({lat:lat, lon:lng})

            const newReport = await Report.create({
                id,
                name,
                address1,
                address2: dataGeo[0].formattedAddress,
                pekerjaan,
                usia,
                jenisKelamin,
                lat,
                lng,
                images,
                answer1,
                answer2,
                kelurahan: dataGeo[0].administrativeLevels.level4long,
                kecamatan: dataGeo[0].administrativeLevels.level3long,
                kabupaten: dataGeo[0].administrativeLevels.level2long,
                provinsi: dataGeo[0].administrativeLevels.level1long,
                AppUserId: app.id,
                status: false
            })

            return { code: 200, data: newReport}
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    verifikasi: async (reportObj) => {
        try {
            const { latKoordinator, lngKoordinator, reportId } = reportObj
            const report = await Report.findByPk(reportId)
            if(!report) {
                return { code: 401, data: "Invalid Report Id" }
            }

            await report.update({
                status: true,
                tglVerifikasi: Date.now(),
                latKoordinator,
                lngKoordinator
            })
            return { code:200, data: report }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    edit: async (reportObj) => {
        try {

        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    delete: async (reportObj) => {
        try {

        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
}

async function getReportDetail(reportId, report) {
    if(!report) {
      report = await Report.findOne({
        where: {
          id: reportId
        },
        include: [
          { model: AppUser },
        ]
      })
    }
    const reportObj = {
      id: report.id,
      name: report.name,
      address1: report.address1,
      address2: report.address2,
      pekerjaan: report.pekerjaan,
      usia: report.usia,
      jenisKelamin: report.jenisKelamin,
      lat: report.lat,
      lng: report.lng,
      images: report.images,
      answer1: report.answer1,
      answer2: report.answer2,
      kelurahan:report.kelurahan,
      kecamatan: report.kecamatan,
      kabupaten: report.kabupaten,
      provinsi: report.provinsi,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      status: report.status,
      latKoordinator: report.latKoordinator,
      lngKoordinator: report.lngKoordinator,
      tglVerifikasi: report.tglVerifikasi
    }
    if(report.AppUser){
      reportObj.AppUserId = report.AppUser.id
      reportObj.AppUserName = report.AppUser.name
    }
    if(report.AppUser.DashboardUser){
      reportObj.CoordinatorId = report.AppUser.DashboardUser.id
      reportObj.CoordinatorName = report.AppUser.DashboardUser.name
    }
    
    return reportObj
}
