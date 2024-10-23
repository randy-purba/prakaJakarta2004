const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')      
const jwtToken = require('../../lib/jwtGenerator') 

const { OtherSurveyor, DashboardUser, OtherSurveyorToken, OtherReport } = models

module.exports = {
    getAllUser: async(appObj) => {
        try {
            const allOtherSurveyor = await OtherSurveyor.findAndCountAll()
            return { code: 200, data: allOtherSurveyor.count }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    get: async (appObj) => {
        try {
            const { query } = appObj
            const {
                limit, sortby, order, page
            } = query
            
            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            
            let sequelizeQuery = {
                // distinct: true,
                order: [
                  [sortby || 'id' , order || 'DESC']
                ],
                limit: lim 
            }
            if(pageNum > 1) {
                sequelizeQuery.limit = [(pageNum-1) * lim || 0, lim] 
            }

            if(lim == 'all'){
                delete sequelizeQuery.limit
            }
            
            const apps = await OtherSurveyor.findAndCountAll(sequelizeQuery)
            const result = { count: apps.count, page: Math.ceil(apps.count / lim), rows: [] }

            let appProcess = await apps.rows.map(async (app) => {
                let allReport = await OtherReport.findAndCountAll({
                    where: {
                        OtherSurveyorId: app.id
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
            const { username, password, RoleId } = appObj
            const id = generatedId() 

            if(RoleId == 'jkvax12g'){
                return { code: 401, data: "You don't have access" }
            }
            
            const newAppUser = await OtherSurveyor.create({
                id,
                username: generatedId(),
                password: generatedId(),
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
                return { code: 400, data: 'username must not be empty' }
            }
            if (!password) {
                return { code: 400, data: 'password must not be empty' }
            }
            const app = await OtherSurveyor.findOne({ where: { username } })
            if (!app) {
                return { code: 401, data: 'username or password is not valid' }
            }

            if(password === app.password){
                const id = generatedId() 
                const data = {
                    username: app.username,
                }

                const header = await jwtToken(
                    { 
                        id: app.id, 
                        username: app.username 
                    },
                    process.env.JWT_SECRET_APP, 
                    {},
                )
        
                const result = { code: 200, data, header }
                
                await OtherSurveyorToken.create({
                    id,
                    jwtToken: header,
                    OtherSurveyorId: app.id
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
            const findOld = await OtherSurveyorToken.find({
                where: {
                    jwtToken: oldToken
                }
            })
            const findNew = await OtherSurveyorToken.find({
                where: {
                    OtherSurveyorId: findOld.OtherSurveyorId
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
            const { OtherSurveyorId, username, password } = appObj
            const app = await OtherSurveyor.findByPk(OtherSurveyorId)

            if(!app) {
                return { code: 400, data: "Invalid App User Id" }
            }

            const result = await app.update({
                username,
                password,
            })

            return { code: 200, data: result }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    delete: async (appObj) => {
        try {
            const { OtherSurveyorId } = appObj
            const app = await OtherSurveyor.findByPk(OtherSurveyorId)
            if(!app) {
                return { code: 404, data: "App User Id Invalid" }
            }

            await OtherSurveyorToken.destroy({ where: { OtherSurveyorId: app.id } })
            await OtherReport.destroy({ where: { OtherSurveyorId: app.id } })
            await app.destroy()
            return { code: 200, data: "Data has been deleted" }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    }
}

async function getAppDetail(appId, app, countReport) {
    if(!app) {
      app = await OtherSurveyor.findOne({
        where: {
          id: appId
        }
      })
    }
    const appObj = {
      id: app.id,
      username: app.username,
      password: app.password,
      createdAt: app.createdAt,
      totalMarker: countReport
    }
    
    return appObj
}
  