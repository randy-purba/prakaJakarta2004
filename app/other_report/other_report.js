const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')
const nodeGeocoder = require('../../lib/geocoder')
const date = require('date-and-time')
const moment = require('moment')
const { Op } = require('sequelize')

const { OtherReport, DashboardUser, OtherSurveyor } = models

module.exports = {
    getAllReport: async (reportObj) => {
        try {
            const allReport = await OtherReport.findAndCountAll()
            return { code: 200, data: allReport.count }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getMobile: async (reportObj) => {
        try {
            const { query, OtherSurveyorId } = reportObj
            const { limit, sortby, order, afterId, filterbydate } = query
            const lim = limit ? Number(limit) : 10
            const app = await OtherSurveyor.findByPk(OtherSurveyorId)
            let sequelizeQuery = {
                where: { 
                    OtherSurveyorId: app.id 
                },
                order: [[sortby || 'id', order || 'DESC']],
                limit: lim
            }
            if(lim == 'all'){
                delete sequelizeQuery.limit
            }
            if (afterId) {
                sequelizeQuery.where = {
                    id : { [Op.lt]: afterId },
                }
                if(order=='ASC'){
                    sequelizeQuery.where.id = { [Op.gt]: afterId }
                } 
            }
            
            if (filterbydate) {
                if(filterbydate === 'Day') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('day'),
                        [Op.lt]: moment().endOf('day')
                    } } )
                } else if (filterbydate === 'Week') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('week'),
                        [Op.lt]: moment().endOf('week')
                    } } )
                } else if (filterbydate === 'Month') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('month'),
                        [Op.lt]: moment().endOf('month')
                    } } )
                }
            }
            const reports = await OtherReport.findAndCountAll(sequelizeQuery)
            const result = { count: reports.count, page: Math.ceil(reports.count / lim), rows: reports.rows }
            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getDetailMobile: async (reportObj) => {
        try {
            const { OtherSurveyorId, otherReportId } = reportObj
            const report = await OtherReport.findByPk(otherReportId)
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
            const { limit, sortby, page, order, filterbydate, filterbysurveyor } = query
            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            
            let sequelizeQuery = {
                include: [
                    { model: OtherSurveyor }
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

            if (filterbydate) {
                if(filterbydate === 'Day') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('day'),
                        [Op.lt]: moment().endOf('day')
                    } } )
                } else if (filterbydate === 'Week') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('week'),
                        [Op.lt]: moment().endOf('week')
                    } } )
                } else if (filterbydate === 'Month') {
                    sequelizeQuery.where = Object.assign(sequelizeQuery.where, { createdAt: {
                        [Op.gt]: moment().startOf('month'),
                        [Op.lt]: moment().endOf('month')
                    } } )
                }
            }

            if(filterbysurveyor){
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { OtherSurveyorId: filterbysurveyor } )
            }

            const reports = await OtherReport.findAndCountAll(sequelizeQuery)

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
                OtherSurveyorId, lat, lng, images
            } = reportObj 

            if (!lat || !lng || !images ) {
                return { code: 400, data: "Required field must be filled" }
            }
            const app = await OtherSurveyor.findByPk(OtherSurveyorId)

            const totalReport = await OtherReport.findAndCountAll({
                where: {
                    OtherSurveyorId: app.id,
                    createdAt: {
                        [Op.gt]: moment().startOf('day'),
                        [Op.lt]: moment().endOf('day')
                    }
                }
            })
            
            if(totalReport.rows.length >= 10) {
                return { code: 500, data: "You can make report 10 per day" }
            }
            
            const id = generatedId()
            const dataGeo = await nodeGeocoder.reverse({lat:lat, lon:lng})

            const newReport = await OtherReport.create({
                id,
                address: dataGeo[0].formattedAddress,
                lat,
                lng,
                images,
                OtherSurveyorId: app.id,
            })

            return { code: 200, data: newReport}
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    verifikasi: async (reportObj) => {
        try {
            
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
      report = await OtherReport.findOne({
        where: {
          id: reportId
        },
        include: [
          { model: OtherSurveyor },
        ]
      })
    }
    const reportObj = {
      id: report.id,
      address: report.address,
      lat: report.lat,
      lng: report.lng,
      images: report.images,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }
    if(report.OtherSurveyor){
      reportObj.OtherSurveyorId = report.OtherSurveyor.id
      reportObj.OtherSurveyorUsername = report.OtherSurveyor.username
    }
    
    return reportObj
}