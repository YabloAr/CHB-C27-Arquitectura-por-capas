//CODERHOUSE BACKEND 43360
//Alumno: Mellyid Salomón
//Test push.
//dotenv -- CONSULTAR Y RESOLVER
import "dotenv/config";

// agregar tambien el valor secret de las sessions para el hash

//DEPENDENCIAS
import express from "express"
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from 'socket.io'
import MongoStore from "connect-mongo"; //for sessions
import session from "express-session"; //sessions
import passport from "passport";
import { initPassport } from "./config/passport.config.js";

//Gestores de rutas y manager de mensajes
import viewsRouter from './routes/views.router.js'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/cart.router.js'
import messagesRouter from './routes/message.router.js'
import MessageManager from "./dao/dbManagers/messagesManager.js";
import sessionsRouter from './routes/sessions.router.js' //sessions

//Definimos el servidor y agregamos el middleware de parseo de las request
const PORT = 8080 //Buena practica, definir una variable con el puerto.
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ServerUp
const httpserver = app.listen(PORT, () => console.log("Server up."))

//Conexion a mi base de datos de Mongo, mi URL personal protegida en .env.
mongoose.set('strictQuery', false) //corrige error de deprecacion del sistema
const connection = mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hiwmxr5.mongodb.net/ecommerce?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }) //añadi estos dos parametros por docs de mongoose, evita futura deprecacion.


//deberia deprecarse por las tokens? O
app.use(session({
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hiwmxr5.mongodb.net/ecommerce?retryWrites=true&w=majority`,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 120
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    // saveUninitialized: al estar en falso, durante la vida de la session, si esta session file no cambia, no se guarda.
    //Para este proyecto, no nos interesa guardar sesiones sin registrar en la db.
    saveUninitialized: false
}))

//Express handlebars
app.engine('handlebars', handlebars.engine()) //habilitamos el uso del motor de plantillas en el servidor.
app.set('views', __dirname + '/views') //declaramos la carpeta con las vistas para las plantillas.
app.set('view engine', 'handlebars') //le decimos a express que use el motor de vistas de handlebars.

//Passport
initPassport()
app.use(passport.initialize())
app.use(passport.session())


//Routers, aqui alojamos los diferentes tipos de request (GET, POST, PUT, DELETE, etc)
app.use('/', viewsRouter) //Definimos la ruta raiz de nuestro proyecto, y las respuestas en vistas con las handlebars.
app.use("/api/products", productsRouter) //router de products
app.use("/api/carts", cartsRouter) //router de carts
app.use('/api/messages', messagesRouter) //router de messages
app.use('/api/sessions', sessionsRouter) //router de sessiones



//------------------COMIENZA Aplicacion chat con socket.io
const messageManager = new MessageManager()

app.use(express.static(__dirname + '/public')) //en el js pasa la magia.
const io = new Server(httpserver) //Declaramos el servidor http dentro del server de express para socket.io

//Encendemos el socket con .on (escucha/recibe)
io.on('connection', socket => {
    // console.log("App.js Chat: New client connected.")
    //el socket espera algun 'message' desde el cliente (index.js), data llega como objeto, {user: x, message: x}
    socket.on('message', async data => {
        try {
            await messageManager.saveMessage(data)
            const allMessages = await messageManager.getAllMessages()
            io.emit('messageLogs', allMessages) //envia al cliente la coleccion completa de mensajes desde la db
        } catch (error) { return { status: 'error', message: `app.js socket.io save or getAll messages failed. ${error.message}` } }
    })
})
//------------------FIN Aplicacion chat con socket.io