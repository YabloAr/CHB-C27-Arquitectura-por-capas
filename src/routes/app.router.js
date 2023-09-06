import { Router } from 'express'
import cartsRouter from './carts.router.js'
import productsRouter from './products.router.js'
import sessionsRouter from './sessions.router.js'
import viewsRouter from './views.router.js'
import messageRouter from './message.router.js'

const router = Router()

router.use('/', viewsRouter) //sin service ni controller
router.use('/api/products', productsRouter)
router.use('/api/carts', cartsRouter)
router.use('/api/messages', messageRouter) //sin service ni controller
router.use('/api/sessions', sessionsRouter) //sin service ni controller

//este comodin me jode la landing
// router.get('*', async (req, res) => {
//     res.status(404).send("URL no valida");
// })

export default router