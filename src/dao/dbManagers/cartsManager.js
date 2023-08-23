import cartsModel from '../models/carts.js'
import ProductManager from './productsManager.js'
import mongoose from 'mongoose'
import cartModel from '../models/carts.js'



const productManager = new ProductManager()

export default class Carts {
    constructor() {
        console.log('dbManager: carts.js. Conectado a Mongo Atlas Db.')
    }

    createCart = async () => {
        try {
            let newCart = {
                products: []
            }
            await cartsModel.create(newCart)
            return ({ status: 'Success.', message: 'Cart created.' })
        } catch (error) { return { status: "error", message: error.message } }

    }

    getAll = async () => {
        //.find vacio, devuelve todos los documentos de la coleccion.
        //.lean sirve para convertir documentos de una db no relacional a objetos json.
        let carts = await cartsModel.find().lean()
        return carts.length <= 0 ? ({ status: 'Error.', message: 'Carts collection is empty.' }) : (carts)
    }

    getCartById = async (id) => {
        return await cartsModel.findById(id).populate('products', 'product')
    }

    addProductToCart = async (cartId, productId) => {
        try {
            const thisCart = await this.getCartById(cartId);
            if (!thisCart) { return { status: "failed", message: 'Cart doesnt exist, check id.' } }

            const thisProduct = await productManager.getProductById(productId)
            if (!thisProduct) { return { status: "failed", message: 'Product doesnt exist in db, check id.' } }

            const productIndex = await thisCart.products.findIndex((p) => p.product._id.toString() === productId);
            if (productIndex !== -1) {
                thisCart.products[productIndex].quantity = parseInt(thisCart.products[productIndex].quantity) + 1
            } else {
                thisCart.products.push({ product: productId, quantity: 1 })
            }

            await cartModel.updateOne({ _id: thisCart._id }, thisCart);

            return { status: 'success', message: 'Product added.', payload: thisCart };
        } catch (error) {
            console.error(error);
            return { status: "error", message: `Try failed, catched error is ${error.message}` }
        };
    }

    deleteProductFromCart = async (cartId, productId) => {
        try {
            const thisCart = await cartsModel.findById(cartId);

            if (!thisCart) {
                return { status: 'failed', message: 'Cart does not exist, check ID.' };
            }

            const foundProduct = await productManager.getProductById(productId);
            if (!foundProduct) {
                return { status: 'failed', message: 'Product does not exist, check ID.' };
            }

            const productIndex = thisCart.products.findIndex((p) => p.product.toString() === productId);

            if (productIndex !== -1) {
                thisCart.products.splice(productIndex, 1);
                await cartsModel.findByIdAndUpdate(thisCart._id, thisCart);
                return { status: 'success', message: 'Product deleted.', payload: thisCart };
            } else {
                return { status: 'failed', message: 'Product not found in the cart.' };
            }
        } catch (error) {
            return { status: 'error', message: `Try failed, caught error: ${error.message}` };
        }
    };

    //ultimo update, clase 17 - Mongoose II
    updateCartProducts = async (cartId, newProducts) => {
        try {
            const thisCart = await cartsModel.findById(cartId)
            thisCart.products = newProducts
            await cartsModel.findByIdAndUpdate(cartId, thisCart);
            return { status: 'success', message: `Complete products of ${cartId} updated.`, payload: thisCart }

        } catch (error) { return { status: 'error', message: `Try failed, caught error: ${error.message}` } }
    }

    //ultimo update, clase 17 - Mongoose II
    updateQuantity = async (cartId, productId, quantity) => {
        try {
            const thisCart = await cartsModel.findById(cartId);
            if (!thisCart) { return { status: 'failed', message: 'Cart does not exist, check ID.' } }

            const thisProduct = thisCart.products.find(item => item.product === productId)
            if (!thisProduct) { return { status: 'failed', message: 'Product does not exist in cart, check ID.' } }

            thisProduct.quantity = quantity

            const productIndex = thisCart.products.findIndex(item => item.product === productId)
            thisCart.products[productIndex] = thisProduct

            await cartsModel.findByIdAndUpdate(thisCart._id, thisCart)
            return { status: 'success', message: 'Product quantity updated.', payload: thisCart };

        } catch (error) { return { status: 'error', message: `Try failed, caught error: ${error.message}` } }
    };

    //ultimo update, clase 17 - Mongoose II
    emptyCart = async (cartId) => {
        try {

            const thisCart = await cartsModel.findById(cartId);
            if (!thisCart) { return { status: 'failed', message: 'Cart does not exist, check ID.' } }

            thisCart.products = []
            await cartModel.findByIdAndUpdate(cartId, thisCart)
            return { status: 'success', message: 'Cart products reseted.', payload: thisCart };

        } catch (error) { return { status: 'error', message: `Try failed, caught error: ${error.message}` } }

    }

}