import User from '../models/User.mjs'
import bcrypt from 'bcrypt'

const AuthController = {

    async register(request, response) {

        response.render('auth/register.html', {
            errors: request.flash('errors'),
            old: request.flash('old')
        })
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
        // TODO PASSWORD 8 chars
        if ( ! password) {
            errors.push('Mot de passe requis')
        }

        if ( ! password_confirm) {
            errors.push('Confirmation requise')
        }

        if (errors.length) {
            request.flash('errors', errors)
            request.flash('old', request.body)
            return response.redirect('/register')
        }

        password = bcrypt.hashSync(password, 12)

        User.create({
            username,
            email,
            password,
            sex,
            birth_day,
            birth_month,
            birth_year,
        })

        return response.json('traitement + envoie de mail')
    }
}

export default AuthController