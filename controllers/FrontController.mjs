import User from '../models/User.mjs'

const FrontController = {
    async index(request, response) {
        const data = {
            auth: request.user // TODO clean this shit
        }

        if (data.auth === undefined) {
            return response.render('index.html', data)
        }

        if (
            data.auth.hasOwnProperty('id') &&
            data.auth.hasOwnProperty('email') &&
            data.auth.hasOwnProperty('password') &&
            data.auth.hasOwnProperty('createdAt')
        ) {

            const users = await User.findAll()
            const data = {
                users,
                auth: request.user
            }

            return response.render('app/index.html', data)
        }
    },
}

export default FrontController