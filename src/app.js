//CODERHOUSE BACKEND 43360
//Alumno: Mellyid Salomón

//DEPENDENCIAS
import "dotenv/config";
import express from "express"
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from 'socket.io'
import MongoStore from "connect-mongo"; //for storing sessions data
import session from "express-session"; //sessions
import passport from "passport";
import { initPassport } from "./config/passport.config.js";
import cors from 'cors'

//Gestores de rutas y manager de mensajes
import appRouter from "./routes/app.router.js";

//Definimos el servidor y agregamos el middleware de parseo de las request
const PORT = 8080 //Buena practica, definir una variable con el puerto.
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors()) //añadimos cors. Por ahora no se ve reflejado en la app porque no lo necesitamos.

//ServerUp
const httpserver = app.listen(PORT, () => console.log("Server up."))

//Conexion a mi base de datos de Mongo, mi URL personal protegida en .env.
mongoose.set('strictQuery', false) //corrige error de deprecacion del sistema
const connection = mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hiwmxr5.mongodb.net/ecommerce?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }) //añadi estos dos parametros por docs de mongoose, evita futura deprecacion.


//deberia deprecarse por las tokens?
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

app.use("/", appRouter)

//------------------COMIENZA Aplicacion chat con socket.io

app.use(express.static(__dirname + '/public')) //en el js pasa la magia.
const io = new Server(httpserver) //Declaramos el servidor http dentro del server de express para socket.io

//Encendemos el socket con .on (escucha/recibe)
io.on('connection', socket => {
    // console.log("App.js Chat: New client connected.")
    //el socket espera algun 'message' desde el cliente (index.js), data llega como objeto, {user: x, message: x}
    socket.on('message', async data => {
        try {
            await MessageManager.saveMessage(data)
            const allMessages = await MessageManager.getAllMessages()
            io.emit('messageLogs', allMessages) //envia al cliente la coleccion completa de mensajes desde la db
        } catch (error) { return { status: 'error', message: `app.js socket.io save or getAll messages failed. ${error.message}` } }
    })
})
//------------------FIN Aplicacion chat con socket.io