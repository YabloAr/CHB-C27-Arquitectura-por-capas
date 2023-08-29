import AppRouter from '../app.router.js'
import CartManager from '../../dao/dbManagers/cartsManager.js'

const manager = new CartManager()

export default class CartRouter extends AppRouter {
    init() {
        //GET CARTS
        this.get('/', async (req, res) => {
            try {
                const carts = await manager.getAll()
                if (carts.length <= 0) {
                    res.send({ status: 'Error', message: 'No existing carts.' })
                } else {
                    res.send(carts)
                }
            } catch (error) {
                console.log(`cart.router get failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //GET BY ID
        this.get('/:cid', async (req, res) => {
            try {
                const cid = req.params.cid
                const foundCart = await manager.getCartById(cid)
                if (foundCart) {
                    res.send(foundCart)
                } else {
                    res.send({ error: `GET cart/:pid failed, id not found.` })
                }
            } catch (error) {
                console.log(`cart.router try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //CREATE CART
        this.post('/', async (req, res) => {
            try {
                const carts = await manager.getAll()
                if (carts.length <= 0) {
                    await manager.createCart()
                    console.log("cartRouter post didnt find any carts in db, but one was created. ")
                    res.send({ status: "Ok", message: "New cart added." })
                } else {
                    await manager.createCart()
                    res.send({ status: "Ok", message: "New cart added." })
                }
            } catch (error) {
                console.log(`cart.router create cart try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //ADD TO CART
        this.post('/:cid/products/:pid', async (req, res) => {
            try {
                const cid = req.params.cid
                const pid = req.params.pid
                const result = await manager.addProductToCart(cid, pid)
                res.send(result)
            } catch (error) {
                console.log(`cart.router add to cart try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //UPDATE ARRAY OF PRODUCTS IN CART
        this.put('/:cid', async (req, res) => {
            try {
                const cid = req.params.cid
                const newProducts = req.body
                const result = await manager.updateCartProducts(cid, newProducts)
                res.send(result)
            } catch (error) {
                console.log(`cart.router update cart try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //UPDATE QUANTITY OF PRODUCT IN CART
        this.put('/:cid/products/:pid', async (req, res) => {
            try {
                const cid = req.params.cid
                const pid = req.params.pid
                const quantity = req.body
                const quantityNumber = parseInt(quantity.quantity)
                const result = await manager.updateQuantity(cid, pid, quantityNumber)
                res.send(result)
            } catch (error) {
                console.log(`cart.router update quantity try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //DELETE PRODUCT FROM CART
        this.delete('/:cid/products/:pid', async (req, res) => {
            try {
                const cid = req.params.cid
                const pid = req.params.pid
                const result = await manager.deleteProductFromCart(cid, pid)
                res.send(result)
            } catch (error) {
                console.log(`cart.router delete product try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //EMPTY CART
        this.delete('/:cid', async (req, res) => {
            try {
                const cid = req.params.cid
                const result = await manager.emptyCart(cid)
                res.send(result)
            } catch (error) {
                console.log(`cart.router delete product try failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })
    }
}