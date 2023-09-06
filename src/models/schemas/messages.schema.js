import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collectionName = 'messages'

const messageSchema = mongoose.Schema({
    user: String,
    message: String
})

//le agregamos el plugin al esquema
messageSchema.plugin(paginate)

//.model(nombre de la coleccion, esquema de los documentos)
const messageModel = mongoose.model(collectionName, messageSchema)

export default messageModel