import Chat from '../../models/Chat.mjs'

import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})
import QueryTypes from "sequelize";

const ChatsController = {
    async get(request, response) {

        if ( ! request.user) {
            return response.json(403)
        }

        const auth = request.user
        const auth_id = auth.id


        const sql = `SELECT * from chats WHERE user_id_1 = ${auth_id} OR user_id_2 = ${auth_id}`;
        let chats = await sequelize.query(sql, { type: QueryTypes.SELECT})
        chats = chats[0]

        response.json(chats)
    },

    async contacts(request, response) {
        if ( ! request.user) {
            return response.json(403)
        }

        const auth = request.user
        const auth_id = auth.id

        const user_id_1 = request.body.user_id_1
        const user_id_2 = request.body.user_id_2

        const field = user_id_1 === auth_id ? 'user_id_2' : 'user_id_1'
        const value = user_id_1 === auth_id ? user_id_2 : user_id_1

        const sql = `SELECT * from users WHERE ${field} = ${value}`
        let user = await sequelize.query(sql, { type: QueryTypes.SELECT})
        user = user[0]
    }
}

export default ChatsController