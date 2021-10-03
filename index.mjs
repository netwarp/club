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
import ConfirmController from "./controllers/Auth/ConfirmController.mjs";

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

app.get('/login', (request, response) => {
    response.render('auth/login.html')
})

// TODO .env
app.listen(8080)