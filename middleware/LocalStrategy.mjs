import strategy from 'passport-local'
import User from '../models/User.mjs'
import bcrypt from "bcrypt";

let LocalStrategy = strategy.Strategy

LocalStrategy = new LocalStrategy(
    async (username, password, done) => {

        const user = await User.findOne({
            where: {
                username
            }
        })

        if ( ! user) {
            return done(null, false, { message: 'Incorrect username' })
        }

        if ( ! bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Incorrect password.' })
        }

        return done(null, user)
    }
)

export default LocalStrategy