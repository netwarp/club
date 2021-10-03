import User from '../../models/User.mjs'
import nunjucks from "nunjucks";
import nodemailer from 'nodemailer'

const ForgotPasswordController = {
    async index(request, response) {

        const data = {
            message: request.flash('message')[0]
        }
        return response.render('auth/forgot-password.html', data)
    },

    async post(request, response) {
        const email = request.body.email

        if ( ! email) {
            request.flash('message', {
                status: 'error',
                text: 'Emil required'
            })
            return response.redirect('/forgot-password')
        }

        const user = await User.findOne({
            where: {
                email
            }
        })

        if ( ! user) {
            request.flash('message', {
                status: 'error',
                text: 'User not found'
            })
            return response.redirect('/forgot-password')
        }

        const email_data = {
            username: user.username,
            id: user.id,
            app_url: process.env.APP_URL
        }

        const email_html = nunjucks.render('email/forgot-password.html', email_data)

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
            subject: 'Forgot password',
            text: 'Forgot password',
            html: email_html
        })
        console.log("Message sent: %s", info.messageId)

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        request.flash('success', 'Please confirm')
        return response.redirect('/')
    }
}

export default ForgotPasswordController