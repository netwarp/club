import Chat from '../../models/Chat.mjs'
import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})
import QueryTypes from "sequelize";

const ChatsController = {
    async index(request, response) {

        //const auth_id = request.user.id

        const sql = `select * from users LEFT JOIN chats ON chats.user_id_1 = users.id WHERE (user_id_1 = ${request.user.id}) OR (user_id_2 = ${request.user.id})`
        let chats = await sequelize.query(sql, { type: QueryTypes.SELECT})
        chats = chats[0]

        const data = {
            chats,
            auth: request.user,
        }

        return response.render('app/chats.html', data)
    }
}

export default ChatsController