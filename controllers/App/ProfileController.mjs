import User from '../../models/User.mjs'
import Chat from '../../models/Chat.mjs'

import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})
import QueryTypes from "sequelize";

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
        const username = request.params.username

        const user = await User.findOne({
            where: {
                username
            }
        })


        const user_id_1 = request.user.id
        const user_id_2 = user.id

        const sql = `SELECT * from chats WHERE (user_id_1 = ${user_id_1} AND user_id_2 = ${user_id_2}) OR  (user_id_1 = ${user_id_2} AND user_id_2 = ${user_id_1}) LIMIT 1;`
        let chat = await sequelize.query(sql, { type: QueryTypes.SELECT})
        chat = chat[0]

        if ( ! chat.length) {

            const data = {
                user_id_1,
                user_id_2
            }

           const new_chat = await Chat.create(data)
        }

        return response.redirect('/chat')

    }
}

export default ProfileController