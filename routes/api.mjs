import express from 'express'
const router_api = express.Router()

import UsersController from '../controllers/API/UsersController.mjs'

// TODO /users to /

router_api.get('/users', UsersController.index)
router_api.get('/users/logged', UsersController.logged)
router_api.get('/users/:username', UsersController.show)

export default router_api