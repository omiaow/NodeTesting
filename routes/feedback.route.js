import { Router } from "express"
import feedbackController from "../controllers/feedback.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

import feedbackCacheMiddleware from "../middleware/feedback.cache.middleware.js"

const router = new Router()

router.post('/', authMiddleware, feedbackController.create)
router.get('/:id', feedbackCacheMiddleware.getCache, feedbackController.get)
router.put('/:id', authMiddleware, feedbackController.update)
router.delete('/:id', authMiddleware, feedbackController.delete)

router.get('/all/:page', feedbackCacheMiddleware.getAllCache, feedbackController.getAll)
router.post('/vote', authMiddleware, feedbackController.vote)


export default router