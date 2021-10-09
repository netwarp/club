import bcrypt from 'bcrypt'
import crypto from 'crypto'
import User from '../../models/User.mjs'
import nunjucks from 'nunjucks'
import nodemailer from 'nodemailer'

const RegisterController = {

    async index(request, response) {

        const data = {
            errors: request.flash('errors'),
            old: request.flash('old')
        }

        response.render('auth/register.html', data)
    },

    async postRegister(request, response) {
        let errors = []
        const username = request.body.username
        const email = request.body.email
        const sex = request.body.sex
        const birth_day = request.body.birth_day
        const birth_month = request.body.birth_month
        const birth_year = request.body.birth_year
        let password = request.body.password
        const password_confirm = request.body.password_confirm

        if ( ! username) {
            errors.push('Le nom est requis')
        }

        if ( ! email) {
            errors.push("L'adresse email est requis")
        }

        if ( ! sex) {
            errors.push('sx requis')
        }

        if ( ! birth_day) {
            errors.push('Jour requis')
        }

        if ( ! birth_month) {
            errors.push('Mois requis')
        }

        if ( ! birth_year) {
            errors.push('Année requise')
        }

        if ( ! password) {
            errors.push('Mot de passe requis')
        }

        if ( ! password_confirm) {
            errors.push('Confirmation requise')
        }

        if (password.length < 10) {
            errors.push('Le mot de passe doit avoir plus de 10 caractères')
        }

        if (password !== password_confirm) {
            errors.push('Les mots de passe ne sont pas identiques')
        }

        if (errors.length) {
            request.flash('errors', errors)
            request.flash('old', request.body)
            return response.redirect('/register')
        }

        password = bcrypt.hashSync(password, 12)
        const confirm_token = crypto.randomBytes(32).toString('hex')

        const user_data = {
            username,
            email,
            password,
            sex,
            birth_day,
            birth_month,
            birth_year,
            confirm_token
        }

        const user = await User.create(user_data)

        const email_data = {
            username,
            confirm_token,
            id: user.id,
            app_url: process.env.APP_URL
        }

        const email_html = nunjucks.render('email/validation.html', email_data)

        const transporter_data = {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // TODO env
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        }

        let transporter = await nodemailer.createTransport(transporter_data)

        let info = await transporter.sendMail({
            from: 'toto@toto.com',
            to: 'toto@toto.com',
            subject: 'Bienvenue',
            text: 'Bienvenue',
            html: email_html
        })
        console.log("Message sent: %s", info.messageId)

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        request.flash('success', 'Please confirm')

        return response.redirect('/login')
    },
}

export default RegisterController