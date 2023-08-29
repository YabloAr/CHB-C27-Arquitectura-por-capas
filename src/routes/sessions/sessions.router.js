import AppRouter from "../app.router.js";
import passport from 'passport'

export default class SessionRouter extends AppRouter {
    init() {
        //REGISTER
        this.get('/register', passport.authenticate('register', { failureRedirect: '/failregister' }), async (req, res) => {
            res.send({ status: 'success', message: 'User registered' })
        })
        this.get('/failedregister', async (req, res) => {
            res.send({ error: 'Failed register' })
        })

        //LOGIN
        this.post('/login', passport.authenticate('login', { failureRedirect: '/failedloginauth' }), async (req, res) => {
            if (!req.user) return res.status(400).send({ status: 'error', error: 'Invalid credentials' })
            // console.log(req.user) //passport authentication, if successfull, returns the user info like in mongoDb in req.user
            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                last_name: req.user.last_name,
                email: req.user.email,
                age: req.user.age,
                password: req.user.password,
                cartId: req.user.cartId,
                role: req.user.role
            }
            res.status(200).send({ status: 200, message: `${req.user.first_name} ${req.user.last_name} logged in.` })
        })
        this.get('/failedloginauth', async (req, res) => {
            console.log('Login failed.')
            res.status(400).send({ status: 400, error: 'Failed Login.' })
        })

        //GITHUB LOGIN
        this.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })
        this.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
            req.session.user = req.user;
            res.redirect('/');
        })

        //USER CURRENT
        this.get('/api/current', (req, res) => {
            res.send({ status: "success", payload: req.user })
        })
        this.post('/logout', async (req, res) => {
            req.session.destroy(error => {
                if (error) { res.status(400).send({ error: 'logout error', message: error }) }
                res.status(200).send('Session ended.')
            })
        })

    }
}