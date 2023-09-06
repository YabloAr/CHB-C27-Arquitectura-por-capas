import { Router } from 'express'
import passport from 'passport'

const router = Router()


//REGISTER
router.get('/register', passport.authenticate('register', { failureRedirect: '/failregister' }), async (req, res) => {
    res.send({ status: 'success', message: 'User registered' })
})
router.get('/failedregister', async (req, res) => {
    res.send({ error: 'Failed register' })
})

//LOGIN
router.post('/login', passport.authenticate('login', { failureRedirect: '/failedloginauth' }), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: 'error', error: 'Invalid credentials' })
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
router.get('/failedloginauth', async (req, res) => {
    console.log('Login failed.')
    res.status(400).send({ status: 400, error: 'Failed Login.' })
})

//GITHUB LOGIN
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
})

//USER CURRENT
router.get('/api/current', (req, res) => {
    res.send({ status: "success", payload: req.user })
})
router.post('/logout', async (req, res) => {
    req.session.destroy(error => {
        if (error) { res.status(400).send({ error: 'logout error', message: error }) }
        res.status(200).send('Session ended.')
    })
})



export default router