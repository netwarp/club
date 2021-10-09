import User from '../../models/User.mjs'

const ConfirmController = {
    async index(request, response) {
        const id = request.params.id
        const confirm_token = request.params.confirm_token
        const user = await User.findByPk(id)

        if ( ! user ) {
            return  await response.json('user not found')
        }

        if ( ! confirm_token) {
            return  await response.json('token not found')
        }

        if ( user.confirm_token !== confirm_token) {
            return  await response.json('token not match')
        }

        if ( user.confirm_token === '') {
            return  await response.json('user already confirmed')
        }

        if ( user.confirm_token === confirm_token) {
            user.confirm_token = ''
            user.save()
            request.flash('success', 'Enregistrement confirmé') // TODO MESSAGE FLASH DISPLAY
            return await response.redirect('/login')
        }
    }
}

export default ConfirmController