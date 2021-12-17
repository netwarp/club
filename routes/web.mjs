import express from 'express'
const router = express.Router()
import RegisterController from '../controllers/Auth/RegisterController.mjs'
import ConfirmController from '../controllers/Auth/ConfirmController.mjs'
import LoginController from '../controllers/Auth/LoginController.mjs'
import ForgotPasswordController from '../controllers/Auth/ForgotPasswordController.mjs'
import ReinitializePasswordController from '../controllers/Auth/ReinitializePasswordController.mjs'
import FrontController from '../controllers/FrontController.mjs'
import multer from 'multer'

import passport from "passport";
import NotificationsController from "../controllers/App/NotificationsController.mjs";
import ensureAuthenticated from "../middleware/ensureAuthenticated.mjs";
import ensureNotAuthenticated from "../middleware/ensureNotAuthenticated.mjs";
import ProfileController from "../controllers/App/ProfileController.mjs";
import AccountController from "../controllers/App/AccountController.mjs";
import ImagesController from '../controllers/App/ImagesController.mjs'

import User from '../models/User.mjs'
import ChatsController from "../controllers/App/ChatsController.mjs";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PATH.storage + '/app/avatars')
    },
    filename: async function (request, file, cb) {

        // TOTO script init mkdir app/avatars
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

        let user = await request.user
        user = await User.findByPk(user.id)
        user.avatar = uniqueSuffix + '.jpg'
        user.save()

        cb(null, uniqueSuffix + '.jpg')

    }
})

const upload = multer({ storage: storage })


router.get('/', FrontController.index)

router.get('/register', ensureNotAuthenticated, RegisterController.index)
router.post('/register', ensureNotAuthenticated, RegisterController.postRegister)

router.get('/confirm/:id/:confirm_token', ensureNotAuthenticated, ConfirmController.index)

router.get('/login', ensureNotAuthenticated, LoginController.index)


router.post('/login', ensureNotAuthenticated,
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true // TODO flash one time
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

// TODO router app
router.get('/notifications', ensureAuthenticated, NotificationsController.index)

router.get('/compte', ensureAuthenticated, AccountController.index)
router.post('/compte', ensureAuthenticated, upload.single('avatar'), AccountController.post)

router.get('/chat', ensureAuthenticated, ChatsController.index)

router.get('/avatars/:src', ImagesController.index)
router.get('/:username', ensureAuthenticated, ProfileController.index)
router.post('/:username', ensureAuthenticated, ProfileController.post)


// TODO test 404


export default router