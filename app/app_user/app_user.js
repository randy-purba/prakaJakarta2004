const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')      
const jwtToken = require('../../lib/jwtGenerator')
const json2xls = require('json2xls')
const fs = require('fs')
const moment = require('moment') 

const { AppUser, DashboardUser, AppToken, Report, Wilayah, Kabupaten, Dapil, sequelize } = models

module.exports = {
    downloadPart: async (appObj) => {
        try {
            const { tanggal, koordinatorId, RoleId } = appObj
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            const first = moment(tanggal, 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:ss')
            const last = moment(tanggal, 'YYYY-MM-DD').add(1,'day').format('YYYY-MM-DD HH:mm:ss')

            let queries = `SELECT A.name AS Nama_Surveyor, D.name AS Nama_Koordinator, W.name AS Wilayah, 
                            K.name AS Kabupaten, DA.name AS Dapil,
                            (SELECT COUNT(*) FROM praka_jakartadb.Reports where AppUserId = A.id
                            AND createdAt >= '${first}' AND createdAt <= '${last}') AS Total_Marker 
                            FROM praka_jakartadb.AppUsers AS A INNER JOIN praka_jakartadb.DashboardUsers AS D 
                            ON A.CoordinatorId = D.id INNER JOIN praka_jakartadb.Wilayahs AS W 
                            ON D.WilayahId = W.id INNER JOIN praka_jakartadb.Kabupatens AS K
                            ON D.KabupatenId = K.id INNER JOIN praka_jakartadb.Dapils AS DA
                            ON D.DapilId = DA.id WHERE A.CoordinatorId = '${koordinatorId}'`
            let result = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )                            

            const dataObj = result.map(obj =>{
                return Object.assign(obj, {Tanggal: tanggal})
            })

            // var xls = json2xls(dataObj,{
            //     fields: ['Tanggal','Wilayah','Kabupaten','Dapil','Nama_Surveyor', 'Nama_Koordinator', 'Total_Marker']
            // });
            // const allData = fs.writeFileSync('public/datapart.xlsx', xls, 'binary');

            return { code: 200, data: dataObj }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    downloadFull: async (appObj) => {
        try {
            const { tanggal, RoleId } = appObj
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            const first = moment(tanggal, 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:ss')
            const last = moment(tanggal, 'YYYY-MM-DD').add(1,'day').format('YYYY-MM-DD HH:mm:ss')

            let queries = `SELECT A.name AS Nama_Surveyor, D.name AS Nama_Koordinator, W.name AS Wilayah, 
                            K.name AS Kabupaten, DA.name AS Dapil,
                            (SELECT COUNT(*) FROM praka_jakartadb.Reports where AppUserId = A.id
                            AND createdAt >= '${first}' AND createdAt <= '${last}') AS Total_Marker 
                            FROM praka_jakartadb.AppUsers AS A INNER JOIN praka_jakartadb.DashboardUsers AS D 
                            ON A.CoordinatorId = D.id INNER JOIN praka_jakartadb.Wilayahs AS W 
                            ON D.WilayahId = W.id INNER JOIN praka_jakartadb.Kabupatens AS K
                            ON D.KabupatenId = K.id INNER JOIN praka_jakartadb.Dapils AS DA
                            ON D.DapilId = DA.id`
            let result = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )                            

            const dataObj = result.map(obj =>{
                return Object.assign(obj, {Tanggal: tanggal})
            })

            // var xls = json2xls(dataObj,{
            //     fields: ['Tanggal','Wilayah','Kabupaten','Dapil','Nama_Surveyor', 'Nama_Koordinator', 'Total_Marker']
            // });
            // const allData = fs.writeFile('public/datafull.xlsx', xls, 'binary');

            return { code: 200, data: dataObj }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    downloadSurveyor: async (appObj) => {
        try {
            const { koordinatorId, RoleId } = appObj
            
            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }


            let queries = `SELECT A.name AS Nama_Surveyor, D.name AS Nama_Koordinator,
                            A.username AS Username, A.password AS Password
                            FROM AppUsers AS A INNER JOIN DashboardUsers AS D 
                            ON A.CoordinatorId = D.id WHERE A.CoordinatorId = '${koordinatorId}'`
            let result = await sequelize.query(queries , { type: sequelize.QueryTypes.SELECT } )                            

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    getAllUser: async(appObj) => {
        try {
            const allUser = await AppUser.findAndCountAll()
            return { code: 200, data: allUser.count }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    get: async (appObj) => {
        try {
            const { DashboardUserId, query } = appObj
            const {
                limit, sortby, order, page, searchbyname, filterbycoordinator, searchbycoordinator,
                filterbywilayah, filterbykabupaten, filterbydapil
            } = query
            const dashboard = await DashboardUser.findByPk(DashboardUserId)
            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            
            let sequelizeQuery = {
                distinct: true,
                include: [
                  { model: DashboardUser }
                ],
                where: { },
                order: [
                  [sortby || 'id' , order || 'DESC']
                ],
                limit: lim 
            }
            if(pageNum > 1) {
                sequelizeQuery.limit = [(pageNum-1) * lim || 0, lim] 
            }

            if(dashboard.RoleId != 'jmkt41ot'){
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { CoordinatorId: dashboard.id } )
            }
            if(searchbyname) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { name: { [Op.like]: `%${searchbyname}%` } } )
            }
            if(searchbycoordinator) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$DashboardUser.name$': { [Op.like]: `%${searchbycoordinator}%` } } )
            }
            if(filterbycoordinator) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { CoordinatorId : filterbycoordinator } )
            }
            if(filterbywilayah) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$DashboardUser.WilayahId$' : filterbywilayah } )
            }
            if(filterbykabupaten) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$DashboardUser.KabupatenId$' : filterbykabupaten } )
            }
            if(filterbydapil) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$DashboardUser.DapilId$' : filterbydapil } )
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
    create: async (appObj) => {
        try {
            const { username, password, name, dob, CoordinatorId, RoleId } = appObj
            const id = generatedId() 
            const generateNumber = Math.floor(Math.random() * 9) + 1
            const coordinator = await DashboardUser.findByPk(CoordinatorId)
            const splitUsername = name.split(' ')
            const splitDob = dob.slice(0,2)
            const fixUsername = splitUsername[0] + splitDob + generateNumber

            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            if(!coordinator) {
                return { code: 404, data: 'Invalid Coordinator Id' }
            }
            const newAppUser = await AppUser.create({
                id,
                username: fixUsername.toLowerCase(),
                password: generatedId(),
                name,
                dob,
                CoordinatorId: coordinator.id
            })
            return { code: 200, data: newAppUser }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    login: async (appObj) => {
        try {
            const { username, password } = appObj
            if (!username) {
                return { code: 400, data: 'Username must not be empty' }
            }
            if (!password) {
                return { code: 400, data: 'Password must not be empty' }
            }
            const app = await AppUser.findOne({ where: { username } })

            if (!app) {
                return { code: 401, data: 'Username or Password is not valid' }
            }

            console.log("app : " + JSON.stringify(app))
            if(password === app.password){
                const coordinator = await DashboardUser.findByPk(app.CoordinatorId)
                const id = generatedId() 
                const data = {
                    username: app.username,
                    name: app.name,
                    dob: app.dob,
                    coordinatorId: coordinator.id,
                    coordinatorName: coordinator.name
                }

                const header = await jwtToken(
                    { 
                        id: app.id, 
                        username: app.username, 
                        coordinatorName: coordinator.name, 
                        coordinatorId: coordinator.id 
                    },
                    process.env.JWT_SECRET_APP, 
                    {},
                )
        
                const result = { code: 200, data, header }
                
                await AppToken.create({
                    id,
                    jwtToken: header,
                    AppUserId: app.id
                })
                return result
            }
            return { code: 401, data: 'email or password is not valid' }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    logout: async (appObj) => {
        try {
            return { code: 200, data: 'you have successfully logged out' }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    cekStatus: async (appObj) => {
        try {
            const { oldToken } = appObj
            const findOld = await AppToken.findOne({
                where: {
                    jwtToken: oldToken
                }
            })
            const findNew = await AppToken.findOne({
                where: {
                    AppUserId: findOld.AppUserId
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
        }
    },
    edit: async (appObj) => {
        try {
            const { AppUserId, name, dob, CoordinatorId, RoleId } = appObj
            const app = await AppUser.findByPk(AppUserId)

            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            if(!app) {
                return { code: 400, data: "Invalid App User Id" }
            }

            const coordinator = await DashboardUser.findByPk(CoordinatorId)
            if(!coordinator) {
                return { code: 404, data: 'Invalid Coordinator Id' }
            }

            const result = await app.update({
                name,
                dob,
                CoordinatorId: coordinator.id
            })

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    delete: async (appObj) => {
        try {
            const { AppUserId, RoleId } = appObj

            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }

            const app = await AppUser.findByPk(AppUserId)
            if(!app) {
                return { code: 404, data: "App User Id Invalid" }
            }

            await AppToken.destroy({ where: { AppUserId: app.id } })
            await Report.destroy({ where: { AppUserId: app.id } })
            await app.destroy()
            return { code: 200, data: "Data has been deleted" }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    }
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

async function getDataExcel(appId, app, countReport) {
    if(!app) {
      app = await AppUser.findOne({
        where: {
          id: appId
        },
        include: [
          { model: DashboardUser, 
            include: [
                { model: Wilayah },
                { model: Kabupaten },
                { model: Dapil }
            ]
        },
        ]
      })
    }
    const appObj = {
      id: app.id,
      Name: app.name,
      TotalMarker: countReport
    }
    
    if(app.DashboardUser){
      appObj.Koordinator = app.DashboardUser.name
    }
    if(app.DashboardUser.Wilayah){
        appObj.Wilayah = app.DashboardUser.Wilayah.name
    }
    if(app.DashboardUser.Kabupaten){
        appObj.Kabupaten = app.DashboardUser.Kabupaten.name
    }
    if(app.DashboardUser.Dapil){
        appObj.Dapil = app.DashboardUser.Dapil.name
    }
    
    return appObj
}
  