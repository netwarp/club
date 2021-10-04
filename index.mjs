import express, {request, response} from 'express'
import session from 'express-session'
import flash from 'connect-flash'
import bodyParser from "body-parser";
import nunjucks from 'nunjucks'
const app = express()

import {Sequelize} from "sequelize"
const sequelize = new Sequelize('club', 'postgres', 'root', {
    host: 'localhost',
    dialect: 'postgres'
})

import RegisterController from './controllers/Auth/RegisterController.mjs'
import ConfirmController from './controllers/Auth/ConfirmController.mjs'
import LoginController from './controllers/Auth/LoginController.mjs'
import ForgotPasswordController from './controllers/Auth/ForgotPasswordController.mjs'
import ReinitializePasswordController from './controllers/Auth/ReinitializePasswordController.mjs'

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

app.get('/', (request, response) => {
    response.json('index')
})


app.get('/register', RegisterController.index)

app.post('/register', RegisterController.postRegister)

app.get('/confirm/:id/:confirm_token', ConfirmController.index)

app.get('/login', LoginController.index)
app.post('/login', LoginController.postLogin)

app.get('/forgot-password', ForgotPasswordController.index)
app.post('/forgot-password', ForgotPasswordController.post)

app.get('/reinitialize-password/:token', ReinitializePasswordController.index)
app.post('/reinitialize-password/:token', ReinitializePasswordController.post)

// TODO .env
app.listen(8080)