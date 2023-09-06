import mongoose from "mongoose";

const collectionName = 'users'
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    age: Number,
    password: {
        type: String
        // required: true //desactivado para que auth de github funcione, actualizar mas adelante.

    },
    cartId: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: 'user'
    }
})

const userModel = mongoose.model(collectionName, userSchema)
export default userModel