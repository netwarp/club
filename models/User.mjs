import dotenv from 'dotenv'

import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sex: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    birth_day: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    birth_month: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    birth_year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {type: Sequelize.DATE, field: 'created_at'},
    updatedAt: {type: Sequelize.DATE, field: 'updated_at'},
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
})

export default User
