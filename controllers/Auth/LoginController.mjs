import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'

const LoginController = {
    async index(request, response) {

        const data = {
            error: request.session.flash?.error.at(-1)
        }

        return response.render('auth/login.html', data)
    },

    async postLogin(request, response) {
        const login = await request.body.login
        const password = await request.body.password

        let user = await User.findOne({
            where: {
                username: login
            },
        })

    }
}

export default LoginController