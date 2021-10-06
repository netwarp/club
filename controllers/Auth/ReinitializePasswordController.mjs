import PasswordReset from '../../models/PasswordReset.mjs'
import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'

const ReinitializePasswordController = {
    async index(request, response) {

        const token = request.params.token


        const password_reset = await PasswordReset.findOne({
            where: {
                token
            }
        })

        if ( ! password_reset) {
            return response.json('error')
        }


        return response.render('auth/reset-password.html')
    },

    async post(request, response) {

        const token = request.params.token
        const password = request.body.password
        const password_confirm = request.body.password_confirm

        const password_reset = await PasswordReset.findOne({
            where: {
                token
            }
        })

        if ( ! password_reset) {
            return response.json('error')
        }

        const user = await User.findOne({
            where: {
                email: password_reset.email
            }
        })

        user.password = bcrypt.hashSync(password_confirm, 12)
        user.save()

        request.flash('message', {
            status: 'success',
            text: 'Password updated'
        })

        return response.redirect('/login')
    }
}

export default ReinitializePasswordController