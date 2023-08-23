import { Router } from "express";
import CartManager from '../dao/dbManagers/cartsManager.js'
import productModel from "../dao/models/products.js";
import { authToken } from "../utils.js";

const cartManager = new CartManager()

const router = Router()

//-------------------------------LANDING PAGE
router.get('/', (req, res) => {
    const toProducts = 'http://localhost:8080/products'
    const toCarts = 'http://localhost:8080/carts'
    const toLogin = 'http://localhost:8080/login'
    const toRegister = 'http://localhost:8080/register'
    const toProfile = 'http://localhost:8080/profile'
    res.render('landing', { toProducts, toCarts, toLogin, toRegister, toProfile })
})

//-------------------------------PRODUCTS VIEW
router.get('/products', async (req, res) => {
    try {
        console.log('entra products')
        if (!req.session.user) res.status(400).send({ status: 'error', message: 'You are not logged in.' })
        const user = req.session.user
        //Optimizado, validamos la query, si no existe, le otorgamos el valor por defecto.
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const sort = parseInt(req.query.sort) || -1
        const category = req.query.category || ''

        //Armamos la pipeline del aggregate
        const skip = (page - 1) * limit; //calcula algo que nose
        const matchStage = category ? { category: category } : {}; //Si existe joya, sino lo deja vacio

        const countPipeline = [ //variable condicional
            { $match: matchStage }, //se filtra por category, si esta vacio devuelve todo sin filtrar
            { $count: 'totalCategoryCount' },//$count siempre va a devolver la cantidad de docs, el string es libre
        ];
        //ejecuta la pipeline para obtener el resultado
        const totalCountResult = await productModel.aggregate(countPipeline).exec();
        //totalCounResult no es un array, pero length igual recibe el dato. Se usa en hasNextPage
        const totalCategoryCount = totalCountResult.length > 0 ? totalCountResult[0].totalCategoryCount : 0;

        //pasamos los valores a la pipeline
        const pipeline = [
            { $match: matchStage },
            { $sort: { price: sort } },
            { $skip: skip },
            { $limit: limit },
        ];

        const products = await productModel.aggregate(pipeline).exec();
        //validaciones de cantidad de paginas segun resultados anteriores
        const hasNextPage = skip + products.length < totalCategoryCount; //boolean
        const hasPrevPage = page > 1;//boolean
        const nextPage = hasNextPage ? page + 1 : null;
        const prevPage = hasPrevPage ? page - 1 : null;

        //finalmente le enviamos mediante el render, los datos necesarios para los handlebars.
        res.render('products', { products, hasPrevPage, hasNextPage, prevPage, nextPage, limit, sort, category, user })

    } catch (error) { res.status(500).send({ status: 'error', error: error.message }); }
})

//-------------------------------CARTS VIEW
router.get('/carts', async (req, res) => {
    if (!req.session?.user) res.redirect('/login');
    let carts = await cartManager.getAll()
    res.render('carts', { carts }) //le enviamos mediante el render, los datos necesarios para los handlebars.
})

//-------------------------------CART DETAILS VIEW
router.get('/carts/:cid', async (req, res) => {
    if (!req.session?.user) res.redirect('/login');
    const cid = req.params.cid
    const thisCart = await cartManager.getCartById(cid)

    const products = thisCart.products.map(productData => ({
        ...productData.product.toObject(),
        quantity: productData.quantity
    }));


    res.render('cart', { cid, products })
})

//-------------------------------CHAT APP
router.get('/chat', (req, res) => {
    res.render('chat', {
        style: 'index.css'
    })
})


//-------------------------------USER UTILITIES VIEWS

//REGISTER
router.get('/register', (req, res) => {
    res.render('register')
})

//LOGIN
router.get('/login', (req, res) => {
    const session = { current: false }
    if (req.session.user) {
        console.log('logged in')
        session.current = true
        session.name = req.session.user.first_name
    }
    res.render('login', { session })
})

//PROFILE VIEW
router.get('/profile', async (req, res) => {
    if (req.session.user === undefined) {
        res.render('failedlogin')
    } else {
        console.log(req.session.user)
        res.render('profile', { user: req.session.user })
    }
})

export default router