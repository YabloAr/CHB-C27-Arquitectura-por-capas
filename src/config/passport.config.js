import passport from 'passport'
import local from 'passport-local'
import userModel from '../dao/models/users.js'
import { createHash, isValidPassword } from '../utils.js'
import gitHubService from 'passport-github2'

const LocalStrategy = local.Strategy

passport.serializeUser((user, done) => {
    done(null, user._id)
})
passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id)
    done(null, user)
})

passport.use('register', new LocalStrategy(
    { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
        const { first_name, last_name, email, age, password: userPassword } = req.body
        try {
            let user = await userModel.findOne({ email: username })
            if (user) {
                console.log("User already exist.")
                return done(null, false) //Retorna null, false. Porque error en si no hay.
            }
            const newUser = { first_name, last_name, email, age, password: createHash(userPassword), cartId: 'for now, just a string' }
            let result = await userModel.create(newUser)
            return done(null, result)
        } catch (error) { return res.status(400).send({ status: "error", error: "" }) }
    }
))

//login strategy
passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (userEmail, password, done) => {
    try {
        const user = await userModel.findOne({ email: userEmail })
        if (!user) {
            console.log("passport.config login strat : user doesnt exist")
            return done(null, false)
        }
        if (!isValidPassword(user, password)) return done(null, false)
        return done(null, user) //cuando esta info sale de aca, queda guardada en req.user
    } catch (error) {
        return done(error)
    }
}))

//github
passport.use('github', new gitHubService({
    clientID: process.env.GIT_HUB_STRATEGY_CLIENT_ID,
    clientSecret: process.env.GIT_HUB_STRATEGY_CLIENT_SECRET,
    callbackURL: process.env.GIT_HUB_STRATEGY_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('passport strat GitHubService profile is:')
        console.log(profile)
        let user = await userModel.findOne({ email: profile.emails[0].value })
        if (!user) {
            let newUser = {
                first_name: profile._json.login,
                last_name: '',
                age: '',
                email: profile.emails[0].value,
                password: '',
                cartId: 'for now, just a string'
            }
            let result = await userModel.create(newUser)
            done(null, result)
        } else {
            done(null, user)
        }
    } catch (error) {
        return done(error)
    }
}))

export const initPassport = () => {/*Quedo vacio despues de la sacar la estrategia 'register' de adentro hecha en clase*/ }