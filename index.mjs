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

import AuthController from './controllers/AuthController.mjs'

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})

app.use(express.static('public'));
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


app.get('/register', AuthController.register)

app.post('/register', AuthController.postRegister)

app.get('/login', (request, response) => {
    response.render('login.html')
})

// TODO .env
app.listen(8080)