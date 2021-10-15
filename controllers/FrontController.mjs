import User from '../models/User.mjs'


import dotenv from 'dotenv'
dotenv.config()

import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})
import QueryTypes from "sequelize";

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
            const user_id = request.user.id
            console.log(`user id : ${user_id}`)

            let users = await sequelize.query(`SELECT id, username, email, avatar, sex, bio FROM users WHERE ID <> ${user_id};`, { type: QueryTypes.SELECT });
            users = users[0]


            const data = {
                users,
                auth: request.user
            }

            return response.render('app/index.html', data)
        }
    },
}

export default FrontController