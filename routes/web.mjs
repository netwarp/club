import express from 'express'
const router = express.Router()
import RegisterController from '../controllers/Auth/RegisterController.mjs'
import ConfirmController from '../controllers/Auth/ConfirmController.mjs'
import LoginController from '../controllers/Auth/LoginController.mjs'
import ForgotPasswordController from '../controllers/Auth/ForgotPasswordController.mjs'
import ReinitializePasswordController from '../controllers/Auth/ReinitializePasswordController.mjs'
import passport from "passport";

router.get('/', (request, response) => {
    response.json('index')
})

router.get('/register', RegisterController.index)
router.post('/register', RegisterController.postRegister)

router.get('/confirm/:id/:confirm_token', ConfirmController.index)

router.get('/login', LoginController.index)
router.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
)

router.get('/forgot-password', ForgotPasswordController.index)
router.post('/forgot-password', ForgotPasswordController.post)

router.get('/reinitialize-password/:token', ReinitializePasswordController.index)
router.post('/reinitialize-password/:token', ReinitializePasswordController.post)

router.get('/logout', (request, response) => {
    request.logout()
    response.redirect('/')
})


export default router