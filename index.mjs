import express, {request, response} from 'express'
import session from 'express-session'
import flash from 'connect-flash'
import bodyParser from "body-parser";
import nunjucks from 'nunjucks'
const app = express()
import passport from 'passport'
import strategy from 'passport-local'
import cookieParser from 'cookie-parser'

const LocalStrategy = strategy.Strategy

import dotenv from 'dotenv'
dotenv.config()

import {Sequelize} from "sequelize"
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})

import RegisterController from './controllers/Auth/RegisterController.mjs'
import ConfirmController from './controllers/Auth/ConfirmController.mjs'
import LoginController from './controllers/Auth/LoginController.mjs'
import ForgotPasswordController from './controllers/Auth/ForgotPasswordController.mjs'
import ReinitializePasswordController from './controllers/Auth/ReinitializePasswordController.mjs'
import User from './models/User.mjs'
import bcrypt from 'bcrypt'

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})

passport.use(new LocalStrategy(
    async function (username, password, done) {
        const user = await User.findOne({
            where: {
                username
            }
        })

        if ( ! user) {
            return done(null, false, { message: 'Incorrect username' })
        }

        if ( ! bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Incorrect password.' })
        }

        return done(null, user)
    }
))

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(cookieParser())

app.use(session({
    secret: 'secret key',
    proxy: true,
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(async (user, done) => {
    const u = await User.findByPk(user.id)
    await console.log(user)
    await done(null, user)
})
passport.deserializeUser((user, done) =>  done(null, user) )


app.get('/', (request, response) => {
    response.json('index')
})

app.get('/register', RegisterController.index)

app.post('/register', RegisterController.postRegister)

app.get('/confirm/:id/:confirm_token', ConfirmController.index)

app.get('/login', LoginController.index)
app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })
);

app.get('/forgot-password', ForgotPasswordController.index)
app.post('/forgot-password', ForgotPasswordController.post)

app.get('/reinitialize-password/:token', ReinitializePasswordController.index)
app.post('/reinitialize-password/:token', ReinitializePasswordController.post)

app.get('/logout', (request, response) => {
    request.logout()
    response.redirect('/')
})

// TODO .env
app.listen(8080)