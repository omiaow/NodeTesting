import db from '../db.js'

import categoryCacheMiddleware from "../middleware/category.cache.middleware.js"
import statusCacheMiddleware from "../middleware/status.cache.middleware.js"

const controller = {
    categories: async (req, res) => {
        try {
            const categoriesQuery = `
                SELECT id, name
                FROM categories
                ORDER BY name;
            `

            const categoriesResult = await db.query(categoriesQuery)

            categoryCacheMiddleware.setCache(categoriesResult.rows)

            res.status(200).json({
                categories: categoriesResult.rows
            })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    statuses: async (req, res) => {
        try {
            const statusesQuery = `
                SELECT id, name
                FROM statuses
                ORDER BY name;
            `
            
            const statusesResult = await db.query(statusesQuery)

            statusCacheMiddleware.setCache(statusesResult.rows)
            
            res.status(200).json({
                statuses: statusesResult.rows
            })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    }
}

export default controller