import dotenv from 'dotenv'
dotenv.config()

import Sequelize from "sequelize";
import User from "./User.mjs";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})

const PasswordReset = sequelize.define('PasswordReset', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {type: Sequelize.DATE, field: 'created_at'},
})

export default PasswordReset