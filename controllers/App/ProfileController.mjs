import User from '../../models/User.mjs'

const ProfileController = {
    async index(request, response) {
        const username = request.params.username

        const user = await User.findOne({
            where: {
                username
            }
        })

        const data = {
            user,
            auth: request.user
        }

        return response.render('app/profile.html', data)
    },

    async post(request, response) {
        
    }
}

export default ProfileController