import User from '../../models/User.mjs'

const UsersController = {
    async index(request, response) {
        const users = await User.findAll()

        return response.json(users)
    },

    async show(request, response) {
        const username = request.params.username

        const user = await User.findOne({
            where: {
                username
            }
        })
        // TODO CATCH ERROR
        response.json(user)
    },

    async logged(request, response) {
        const user = request.user

        response.json(user)
    }
}

export default UsersController