import express from 'express'
import session from 'express-session'
import flash from 'connect-flash'
import bodyParser from "body-parser";
import nunjucks from 'nunjucks'
const app = express()
import passport from 'passport'
import redis from 'redis'
import connectRedis from 'connect-redis'

import cookieParser from 'cookie-parser'

import dotenv from 'dotenv'
dotenv.config()

import User from './models/User.mjs'

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})

const RedisStore = connectRedis(session)
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

import LocalStrategy from './middleware/LocalStrategy.mjs'
passport.use(LocalStrategy)

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(cookieParser())

app.use(session({
    secret: process.env.APP_SESSION,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient }),
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(async (user, done) => {
    const u = await User.findByPk(user.id)
    await done(null, user)
})
passport.deserializeUser((user, done) =>  done(null, user) )

// TODO clean this shit
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
global.PATH = {
    base: __dirname,
    storage: __dirname + '/storage'
}


import router from './routes/web.mjs'
import router_api from './routes/api.mjs'
app.use('/', router)
app.use('/api', router_api)

app.listen(process.env.APP_PORT)