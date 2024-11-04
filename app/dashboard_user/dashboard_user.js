const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')    
const jwtToken = require('../../lib/jwtGenerator')
const moment = require('moment')
const { Op } = require('sequelize')

const { DashboardUser, sequelize, Role, DashboardToken, Wilayah, Kabupaten, Dapil, AppToken, AppUser, Report } = models

module.exports = {
    downloadKoordinator: async (appObj) => {
        try {
            const { RoleId } = appObj
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            let queries = `SELECT D.name AS Nama_Koordinator,
                            D.username AS Username, D.password AS Password
                            FROM DashboardUsers AS D WHERE D.RoleId != 'jmkt41ot' AND D.RoleId != 'jkvax12g'`
            let result = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )                            

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getWilayah: async (dashboardObj) => {
        try {
            const { query } = dashboardObj
            const wilayah = await Wilayah.findAll()

            return { code: 200, data: wilayah }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getKabupaten: async (dashboardObj) => {
        try {
            const { query } = dashboardObj
            const { filterbywilayah } = query

            let sequelizeQuery = {
                where: { } 
            }

            if(filterbywilayah) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { WilayahId: filterbywilayah } )
            }

            const kabupatens = await Kabupaten.findAll(sequelizeQuery)

            return { code: 200, data: kabupatens }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getDapil: async (dashboardObj) => {
        try {
            const { query } = dashboardObj
            const { filterbykabupaten } = query

            let sequelizeQuery = {
                where: { } 
            }

            if(filterbykabupaten) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { KabupatenId: filterbykabupaten } )
            }

            const dapils = await Dapil.findAll(sequelizeQuery)

            return { code: 200, data: dapils }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    listSurveyor: async (appObj) => {
        try {
            const { DashboardUserId, query } = appObj
            const {
                limit, sortby, order, afterId,
            } = query
            const dashboard = await DashboardUser.findByPk(DashboardUserId)
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10

            let sequelizeQuery = {
                distinct: true,
                include: [
                  { model: DashboardUser }
                ],
                where: {
                    CoordinatorId: dashboard.id
                },
                order: [
                  [sortby || 'id' , order || 'DESC']
                ],
                limit: lim 
            }

            if (afterId) {
                sequelizeQuery.where = {
                    id : { [Op.lt]: afterId },
                }
                if(order=='ASC'){
                    sequelizeQuery.where.id = { [Op.gt]: afterId }
                } 
            }

            if(lim == 'all'){
                delete sequelizeQuery.limit
            }
            
            const apps = await AppUser.findAndCountAll(sequelizeQuery)
            const result = { count: apps.count, page: Math.ceil(apps.count / lim), rows: [] }
            let appProcess = await apps.rows.map(async (app) => {
                let allReport = await Report.findAndCountAll({
                    where: {
                        AppUserId: app.id
                    }
                })
                let appObject = await getAppDetail(app.id, app, allReport.count)
                await result.rows.push(appObject)
            })
            await Promise.all(appProcess)

            return { code: 200, data: Object.assign(result, { page: Math.ceil(result.count / lim) || 1 }) }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    listReport: async (reportObj) => {
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
                sequelizeQuery.where = sequelizeQuery.where = Object.assign(sequelizeQuery.where, {
                    id : { [Op.lt]: afterId },
                })
                if(order=='ASC'){
                    sequelizeQuery.where.id = sequelizeQuery.where = Object.assign(sequelizeQuery.where, { [Op.gt]: afterId } )
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
            const reports = await Report.findAndCountAll(sequelizeQuery)
            const result = { count: reports.count, page: Math.ceil(reports.count / lim), rows: reports.rows }
            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getDetailReport: async (reportObj) => {
        try {
            const { reportId } = reportObj
            const report = await Report.findByPk(reportId)
            if(!report) {
                return { code: 401, data: "Invalid Report Id" }
            }
            return { code:200, data: report }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    get: async (dashboardObj) => {
        try {
            const { query } = dashboardObj
            const {
                limit, sortby, order, page, searchbyname, filterbywilayah,
                filterbykabupaten, filterbydapil
            } = query

            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            let sequelizeQuery = {
                distinct: true,
                include: [
                  { model: Role },
                  { model: Wilayah },
                  { model: Kabupaten },
                  { model: Dapil }
                ],
                where: { 
                    RoleId: { [Op.ne]: 'jmkt41ot' }
                },
                order: [
                  [sortby || 'id' , order || 'DESC']
                ],
                limit: lim 
            }
            if(pageNum > 1) {
                sequelizeQuery.limit = [(pageNum-1) * lim || 0, lim] 
            }
            if(searchbyname) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { name: { [Op.like]: `%${searchbyname}%` } } )
            }
            if(filterbywilayah) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { WilayahId: filterbywilayah } )
            }
            if(filterbykabupaten) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { KabupatenId: filterbykabupaten } )
            }
            if(filterbydapil) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { DapilId: filterbydapil } )
            }
            if(lim == 'all'){
                delete sequelizeQuery.limit
            }
            
            const dashboards = await DashboardUser.findAndCountAll(sequelizeQuery)
            const result = { count: dashboards.count, page: Math.ceil(dashboards.count / lim), rows: [] }
            let dashboardProcess = await dashboards.rows.map(async (dashboard) => {
                let dashboardObject = await getDashboardDetail(dashboard.id, dashboard)
                await result.rows.push(dashboardObject)
            })
            await Promise.all(dashboardProcess)
            return { code: 200, data: Object.assign(result, { page: Math.ceil(result.count / lim) || 1 }) }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    create: async (dashboardObj) => {
        try {
            const { WilayahId, DapilId, KabupatenId, name, dob, RoleId } = dashboardObj
            const id = generatedId() 
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            const generateNumber = Math.floor(Math.random() * 9) + 1 
            const splitUsername = name.split(' ')
            const splitDob = dob.split('-')
            const fixUsername = splitUsername[0] + splitDob[2] + generateNumber
            
            const wilayah = await Wilayah.findByPk(WilayahId)
            const kabupaten = await Kabupaten.findByPk(KabupatenId)
            const dapil = await Dapil.findByPk(DapilId)

            if(!wilayah) {
                return { code: 400, data: "Wilayah Id not found" }
            }
            if(!kabupaten) {
                return { code: 400, data: "Wilayah Id not found" }
            }
            if(!dapil) {
                return { code: 400, data: "Wilayah Id not found" }
            }

            const newDashboardUser = await DashboardUser.create({
                id,
                username: fixUsername.toLowerCase(),
                password: generatedId(),
                name,
                dob,
                WilayahId,
                DapilId,
                KabupatenId,
                RoleId: 'jmdsa4lk'
            })
            return { code: 200, data: newDashboardUser }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    login: async (dashboardObj) => {
        try {
            const { username, password } = dashboardObj
            if (!username) {
                return { code: 400, data: 'username must not be empty' }
            }
            if (!password) {
                return { code: 400, data: 'password must not be empty' }
            }
            const dashboard = await DashboardUser.findOne({ where: { username } })
            if (!dashboard) {
                return { code: 401, data: 'username or password is not valid' }
            }

            if(password === dashboard.password){
                const role = await Role.findByPk(dashboard.RoleId)
                const id = generatedId()
                const data = {
                    username: dashboard.username,
                    name: dashboard.name,
                    dob: dashboard.dob,
                    roleId: role.id,
                    roleName: role.name
                }

                const header = await jwtToken(
                    { 
                        id: dashboard.id, 
                        username: dashboard.username, 
                        role: role.name, 
                        RoleId: role.id 
                    },
                    process.env.JWT_SECRET_DASHBOARD, 
                    {},
                )

                const result = { code: 200, data, header }
                
                await DashboardToken.create({
                    id,
                    jwtToken: header,
                    DashboardUserId: dashboard.id
                })
                return result
            }
            return { code: 401, data: 'email or password is not valid' }          
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    logout: async (dashboardObj) => {
        try {
            return { code: 200, data: 'you have successfully logged out' }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    cekStatus: async (dashboardObj) => {
        try {
            const { oldToken } = dashboardObj
            const findOld = await DashboardToken.findOne({
                where: {
                    jwtToken: oldToken
                }
            })
            if(!findOld) {
                return { code: 400, data: "Invalid Token" }
            }
            const findNew = await DashboardToken.findOne({
                where: {
                    DashboardUserId: findOld.DashboardUserId
                },
                order: [
                    ['createdAt', 'DESC'],
                ]
            })
            if (findOld.jwtToken != findNew.jwtToken) {
                return { code: 401, data: 'Please Relogin' }
            } 
            return { code: 200, data: "You're Login Before" }
        } catch (e) {
            return { code: 500, data: e.message }
        }jmaxa451
    },
    edit: async (dashboardObj) => {
        try {
            const { dashboardUserId, WilayahId, DapilId, KabupatenId, name, dob, RoleId } = dashboardObj
            const dashboard = await DashboardUser.findByPk(dashboardUserId)
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            if(!dashboard) {
                return { code: 400, data: "Invalid Dashboard User Id " }
            }

            const wilayah = await Wilayah.findByPk(WilayahId)
            const kabupaten = await Kabupaten.findByPk(KabupatenId)
            const dapil = await Dapil.findByPk(DapilId)

            if(!wilayah) {
                return { code: 400, data: "Wilayah Id not found" }
            }
            if(!kabupaten) {
                return { code: 400, data: "Wilayah Id not found" }
            }
            if(!dapil) {
                return { code: 400, data: "Wilayah Id not found" }
            }

            const result = await dashboard.update({
                name,
                dob,
                WilayahId,
                DapilId,
                KabupatenId
            })

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    delete: async (dashboardObj) => {
        try {
            const { dashboardUserId, RoleId } = dashboardObj
            const dashboard = await DashboardUser.findByPk(dashboardUserId)
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            if(!dashboard) {
                return { code: 404, data: "Dashboard User Id Invalid" }
            }

            await DashboardToken.destroy({ where: { DashboardUserId: dashboard.id } })
            const app = await AppUser.findAll({
                where: {
                    CoordinatorId: dashboard.id
                }
            })
            await AppToken.destroy({ where: { AppUserId: app.map(val => val.id) } })
            await Report.destroy({ where: { AppUserId: app.map(val => val.id) } })
            await AppUser.destroy({ where: { id: app.map(val => val.id) } })
            await dashboard.destroy()
            return { code: 200, data: "Data has been deleted." }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    }
}

async function getDashboardDetail(dashboardId, dashboard) {
    if(!dashboard) {
      dashboard = await DashboardUser.findOne({
        where: {
          id: dashboardId
        },
        include: [
          { model: Role },
        ]
      })
    }
    const dashboardObj = {
      id: dashboard.id,
      username: dashboard.username,
      password: dashboard.password,
      name: dashboard.name,
      dateOfBirth: dashboard.dob,
      createdAt: dashboard.createdAt,
    }
    if(dashboard.Role){
      dashboardObj.roleId = dashboard.Role.id
      dashboardObj.roleName = dashboard.Role.name
    }
    if(dashboard.Wilayah){
        dashboardObj.WilayahId = dashboard.Wilayah.id
        dashboardObj.WilayahName = dashboard.Wilayah.name
    }
    if(dashboard.Kabupaten){
        dashboardObj.KabupatenId = dashboard.Kabupaten.id
        dashboardObj.KabupatenName = dashboard.Kabupaten.name
    }
    if(dashboard.Dapil){
        dashboardObj.DapilId = dashboard.Dapil.id
        dashboardObj.DapilName = dashboard.Dapil.name
    }  
    
    
    return dashboardObj
  }
  
  async function getAppDetail(appId, app, countReport) {
    if(!app) {
      app = await AppUser.findOne({
        where: {
          id: appId
        },
        include: [
          { model: DashboardUser },
        ]
      })
    }
    const appObj = {
      id: app.id,
      username: app.username,
      password: app.password,
      name: app.name,
      dateOfBirth: app.dob,
      createdAt: app.createdAt,
      totalMarker: countReport
    }
    if(app.DashboardUser){
      appObj.coordinatorId = app.DashboardUser.id
      appObj.coordinatorName = app.DashboardUser.name
    }
    
    return appObj
}
