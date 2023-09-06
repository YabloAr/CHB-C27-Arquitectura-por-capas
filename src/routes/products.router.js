import { Router } from 'express'
import ProductsController from '../controllers/products.controller.js'

const router = Router()

router.get('/', ProductsController.getAll)
router.get('/:pid', ProductsController.getProductById)
router.post('/', ProductsController.createProduct)
router.put('/:pid', ProductsController.updateProduct)
router.delete('/:pid', ProductsController.deleteProduct)

export default router