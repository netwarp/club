import express, {request, response} from 'express'
import bodyParser from "body-parser";
import nunjucks from 'nunjucks'
const app = express()

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})

app.use(bodyParser.json())

app.get('/', (request, response) => {
    response.json('index')
})

app.get('/register', (request, response) => {
    response.render('register.html')
})

app.post('/register', (request, response) => {
    response.json(1)
})

app.get('/login', (request, response) => {
    response.render('login.html')
})





// TODO .env
app.listen(8080)