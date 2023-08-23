import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const collectionName = 'products'

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
}
)

//le agregamos el plugin al esquema
productSchema.plugin(paginate)

//.model(nombre de la coleccion, esquema de los documentos)
const productModel = mongoose.model(collectionName, productSchema)

export default productModel