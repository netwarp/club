import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'

const AccountController = {
    async index(request, response) {
        const data = {
            auth: request.user
        }

        response.render('app/account.html', data)
    },

    async post(request, response) {

        const auth = request.user

        const username = request.body.username
        const email = request.body.email
        const bio = request.body.bio
        const password = request.body.password
        const avatar = request.body.avatar

        const user = await User.findByPk(auth.id)

        if (username) {
            user.username = user
        }

        if (email) {
            user.email = email
        }

        if (bio) {
            user.bio = bio
        }

        if (password) {
            user.password = bcrypt.hashSync(password)
        }



        request.flash('success', 'Compte édité avec succès')
        return response.redirect('/compte')
    }
}

export default AccountController