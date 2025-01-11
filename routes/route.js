import { Router } from "express"
import controller from "../controllers/controller.js"

import categoryCacheMiddleware from "../middleware/category.cache.middleware.js"
import statusCacheMiddleware from "../middleware/status.cache.middleware.js"

const router = new Router()

router.get('/categories', categoryCacheMiddleware.getCache, controller.categories)
router.get('/statuses', statusCacheMiddleware.getCache, controller.statuses)

export default router