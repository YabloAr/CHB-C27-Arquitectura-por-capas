import { Router } from 'express'
import CartsController from '../controllers/carts.controller.js'

const router = Router()

//-----api/carts

//GET CARTS
router.get('/', CartsController.getAll)

//GET BY ID
router.get('/:cid', CartsController.getCartById)

//CREATE CART
router.post('/', CartsController.createCart)

//ADD TO CART
router.post('/:cid/products/:pid', CartsController.addToCart)

//UPDATE QUANTITY OF PRODUCT IN CART
router.put('/:cid/products/:pid', CartsController.updateQuantity)

//UPDATE ARRAY OF PRODUCTS IN CART
router.put('/:cid', CartsController.replaceProducts)

//DELETE PRODUCT FROM CART
router.delete('/:cid/products/:pid', CartsController.deleteProductFromCart)

//EMPTY CART
router.delete('/:cid', CartsController.emptyCart)


export default router