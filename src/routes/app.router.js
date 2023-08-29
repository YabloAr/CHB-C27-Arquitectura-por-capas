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