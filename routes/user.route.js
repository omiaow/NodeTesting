import { Router } from "express"
import userAuthController from "../controllers/user.auth.controller.js"

const router = new Router()

router.post('/create', userAuthController.create)
router.post('/verify', userAuthController.verify)
router.post('/login', userAuthController.login)
router.post('/reset', userAuthController.reset)

export default router