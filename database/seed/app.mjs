import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'
import Sequelize from 'sequelize'
import Chat from "../../models/Chat.mjs";

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})
import QueryTypes from "sequelize";

async function runUsers() {

    const users = [
        {
            username: 'toto2',
            email: 'toto2@toto2.com',
            password: bcrypt.hashSync('toto2', 12),
            sex: 1,
            birth_day: 1,
            birth_month: 2,
            birth_year: 1990
        },
        {
            username: 'lol2',
            email: 'lol2@lol2.com',
            password: bcrypt.hashSync('lol2', 12),
            sex: 0,
            birth_day: 1,
            birth_month: 2,
            birth_year: 1990
        },
        {
            username: 'bob',
            email: 'bob@bob.com',
            password: bcrypt.hashSync('bob', 12),
            sex: 0,
            birth_day: 1,
            birth_month: 2,
            birth_year: 1990
        },
    ];

    for await (const user of users) {
        User.create(user)
    }
}

async function chats() {

    async function createChat() {
        let user_ids = []

        let user_1 = await User.findOne({
            order: Sequelize.literal('random()')
        })
        let user_id_1 = user_1.id

        user_ids = [...user_ids, user_id_1]

        let user_2 = await User.findOne({
            order: Sequelize.literal('random()')
        })
        let user_id_2 = user_2.id

        if (user_ids.includes(user_id_2)) {
            return
        }

        user_ids = [...user_ids, user_id_2]


        const sql = `SELECT * from chats WHERE (user_id_1 = ${user_id_1} AND user_id_2 = ${user_id_2}) OR  (user_id_1 = ${user_id_2} AND user_id_2 = ${user_id_1}) LIMIT 1;`
        let chat = await sequelize.query(sql, { type: QueryTypes.SELECT})

        if ( ! chat[1].rowCount ) {
            console.log('supposed create')
            Chat.create({
                user_id_1: user_ids[0],
                user_id_2: user_ids[1],
            })
        }
    }

    await createChat()
    await createChat()
    await createChat()
    await createChat()
    await createChat()
    await createChat()

}

//runUsers()
//chats()
