import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'

const LoginController = {
    async index(request, response) {
        return response.render('auth/login.html')
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