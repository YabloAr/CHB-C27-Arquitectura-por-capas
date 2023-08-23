import productsModel from '../models/products.js'

export default class Products {
    constructor() {
        console.log('dbManager: products.js. Conectado a Mongo Atlas Db.')
    }

    //GET ALL
    getAll = async () => {
        //.find vacio, devuelve todos los documentos de la coleccion.
        //.lean sirve para convertir documentos de una db no relacional a objetos json.
        let products = await productsModel.find().lean()
        return products
    }

    //generateNewCode 7 digits
    generateNewCode = async () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomCode = '';
        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomCode += characters[randomIndex];
        }
        return randomCode
    }

    //NEW PRODUCT
    saveProduct = async (product) => {
        product.code = await this.generateNewCode()
        try {
            await productsModel.create(product)
            return ({ status: 'Success.', message: `Product added.`, payload: product })
        } catch (error) { return { status: 'Error', message: error.message } }
    }

    //GET PRODUCT BY ID
    getProductById = async (pid) => {
        try {
            let foundProduct = await productsModel.findById(pid)
            if (!foundProduct) return { status: 'failed.', message: `Product ${pid} not found in db.` }
            return foundProduct
        } catch (error) { return { status: 'Error', message: error.message } }
    }

    //UPDATE PRODUCT
    updateProduct = async (id, newData) => {
        let foundProduct = await productsModel.findOne({ _id: id })
        let updatedProperties = {}
        if (newData.title) {
            await foundProduct.updateOne({ $set: { title: newData.title } })
            updatedProperties.title = newData.title
        }
        if (newData.description) {
            await foundProduct.updateOne({ $set: { description: newData.description } })
            updatedProperties.description = newData.description
        };
        if (newData.price) {
            await foundProduct.updateOne({ $set: { price: newData.price } })
            updatedProperties.price = newData.price
        };
        if (newData.thumbnail) {
            await foundProduct.updateOne({ $set: { thumbnail: newData.thumbnail } })
            updatedProperties.thumbnail = newData.thumbnail
        };
        if (newData.code) {
            await foundProduct.updateOne({ $set: { code: newData.code } })
            updatedProperties.code = newData.code
        };
        if (newData.stock) {
            await foundProduct.updateOne({ $set: { stock: newData.stock } })
            updatedProperties.stock = newData.stock

        };
        return { status: 'Success.', message: 'Product modified.', payload: updatedProperties }
    }

    //DELETE PRODUCT
    deleteProduct = async (id) => {
        try {
            await productsModel.deleteOne({ _id: id });
            return { status: 'Success.', message: `Product ${id} deleted.` };
        } catch (error) { return { status: 'Error', message: error.message } }
    };

}