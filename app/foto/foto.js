const response = require('../../lib/newResponse')
const models = require('../../config/models')
const generatedId = require('../../lib/idGenerator')    
const jwtToken = require('../../lib/jwtGenerator')

const { DashboardUser, Foto, Kegiatan, Daerah } = models

module.exports = {
    listKegiatan: async (fotoObj) => {
        try {
            const { query } = fotoObj
            const kegiatan = await Kegiatan.findAll()

            return { code: 200, data: kegiatan }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    listDaerah: async (fotoObj) => {
        try {
            const { query } = fotoObj
            const daerah = await Daerah.findAll()

            return { code: 200, data: daerah }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    get: async (fotoObj) => {
        try {
            const { query } = fotoObj
            const { limit, sortby, page, order, KegiatanId, DaerahId } = query
            const pageNum = Number(page) 
            const lim = limit == 'all' ? 'all' : limit ? Number(limit) : 10
            
            let sequelizeQuery = {
                include: [{ all: true }], 
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

            if(KegiatanId) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$Kegiatan.id$': KegiatanId } )
            }
            if(DaerahId) {
                sequelizeQuery.where = Object.assign(sequelizeQuery.where, { '$Daerah.id$': DaerahId } )
            }

            const reports = await Foto.findAndCountAll(sequelizeQuery)

            const result = { count: reports.count, page: Math.ceil(reports.count / lim), rows: reports.rows }

            return { code: 200, data: Object.assign(result, { page: Math.ceil(result.count / lim) || 1 }) }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    },
    create: async (fotoObj) => {
        try {
            const { KegiatanId, DaerahId, photo, keterangan } = fotoObj
            const id = generatedId() 
            
            // if(RoleId != 'jmvsa53l'){
            //     return { code: 401, data: "You don't have access" }
            // }
            
            const kegiatan = await Kegiatan.findByPk(KegiatanId)
            const daerah = await Daerah.findByPk(DaerahId)

            if(!kegiatan) {
                return { code: 400, data: "Kegiatan Id not found" }
            }
            if(!daerah) {
                return { code: 400, data: "Daerah Id not found" }
            }

            const newFoto = await Foto.create({
                id,
                photo,
                keterangan,
                KegiatanId,
                DaerahId,
            })
            return { code: 200, data: newFoto }
        } catch (e) {
            return { code: 500, data: e.message }
        }
    }
}
