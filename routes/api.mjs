import express from 'express'
const router_api = express.Router()

import UsersController from '../controllers/API/UsersController.mjs'
import ChatsController from '../controllers/API/ChatsController.mjs'

// TODO /users to /

router_api.get('/users', UsersController.index)
router_api.get('/users/logged', UsersController.logged)
router_api.get('/users/:username', UsersController.show)

router_api.get('/chats', ChatsController.get)
router_api.post('/chats/contacts', ChatsController.contacts)

export default router_api