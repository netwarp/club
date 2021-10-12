import User from '../../models/User.mjs'
import bcrypt from 'bcrypt'
import {Buffer} from 'buffer'
import fs from 'fs'
import * as buffer from "buffer";

const AccountController = {
    async index(request, response) {
        const data = {
            auth: request.user
        }

        response.render('app/account.html', data)
    },

    async post(request, response) {

        const auth = request.user

        const username = request.body.username
        const email = request.body.email
        const bio = request.body.bio
        const password = request.body.password
        const avatar = request.body.avatar

        const user = await User.findByPk(auth.id)

        if (username) {
            user.username = user
        }

        if (email) {
            user.email = email
        }

        if (bio) {
            user.bio = bio
        }

        if (password) {
            user.password = bcrypt.hashSync(password)
        }

        if (avatar) {
            // TODO CHECK SIZE AND MIMETYPE
            let file = request.file
            file = file.buffer.data
            file = Buffer.from(file)

            fs.writeFile('storage/test.jpg', file)
        }

        //return response.json(request.file)
    }
}

export default AccountController