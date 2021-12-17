import dotenv from 'dotenv'
dotenv.config()

import Sequelize from "sequelize";
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
})

const Chat = sequelize.define('Chat', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id_1: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id_2: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {type: Sequelize.DATE, field: 'created_at'},
    updatedAt: {type: Sequelize.DATE, field: 'updated_at'},
}, {
        sequelize,
        modelName: 'Chat',
        tableName: 'chats'
})
export default Chat