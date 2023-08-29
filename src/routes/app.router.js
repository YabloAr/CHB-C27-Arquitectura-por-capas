import { Router } from 'express'

export default class AppRouter {
    constructor() {
        this.router = Router()
        this.init()
    }
    getRouter() {
        return this.router
    }
    init() { } //esta inicializacion, es para las clases heredadas.

    //Inicia funciones de apoyo
    isString(value) {
        return typeof value === 'string';
    }
    isNumber(value) {
        return typeof value === 'number';
    }
    checkProductValues(thisProduct) {
        try {
            //primer validacion, existencia de propiedades y tipo de dato de las mismas
            if (this.isString(thisProduct.title) === true &&
                this.isString(thisProduct.description) === true &&
                this.isNumber(thisProduct.price) === true &&
                this.isString(thisProduct.thumbnail) == true &&
                this.isString(thisProduct.category) === true &&
                this.isNumber(thisProduct.stock) === true) {
                return true
            } else {
                console.log("Product Router: Validacion (existencia y tipo de datos) fallida.")
                return false
            }
        } catch (error) {
            console.log(`Product Router: checkProductValues resultado try/catch fallida, ${error.message}`)
        }
    }
    //terminan funciones de apoyo


    applyMiddlewares(callbacks) {
        return callbacks.map(callback => async (...params) => {
            try {
                //this es el contexto, en este caso, trabajara dentro de esta instancia de clase.
                //params, contiene req,res,next.
                await callback.apply(this, params)
            } catch (error) {
                console.log(error)
                //params[1] seria 'res'
                params[1].status(500).send(error)
            }
        })
    }

    //path es la url
    //los callbacks serian los middlewares
    //Its purpose is to take an array of callback functions and create a single callback function that chains the execution of 
    //these callbacks. This chaining ensures that all the callbacks are executed in order when the route is accessed.
    get(path, ...callbacks) {
        this.router.get(path, this.applyMiddlewares(callbacks))
    }

    post(path, ...callbacks) {
        this.router.post(path, this.applyMiddlewares(callbacks))
    }

    put(path, ...callbacks) {
        this.router.put(path, this.applyMiddlewares(callbacks))
    }

    delete(path, ...callbacks) {
        this.router.delete(path, this.applyMiddlewares(callbacks))
    }

}