//Paso Uno, crear utils
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import "dotenv/config";

// Devuelve una string con el password hasheado. El proceso es IRREVERSIBLE.
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//compareSyync tomara primero el password sin hashear y lo compara con el password ya hasheado en la base 
//de datos. Devuelve true o false dependiendo si el password coincide o no.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

//--------------------------Json Web Token, log 18.08
//La logica esta bien, pero en el proceso tuve un problema con los headers de fetch, que no llegaban al servidor
//con la propiedad 'Authorization': 'Bearer {tokenid}', entonces el req.headers.authorization llega como undefined.
const KEY = process.env.JASONWEBTOKEN_KEY
export const generateToken = (user) => {
    const token = jwt.sign({ user }, KEY, { expiresIn: '6h' })
    return token //contiene solamente un string encryptado.
}
export const authToken = (req, res, next) => {
    const headerAuth = req.headers
    console.log(req.headers.authorization)
    console.log('utils authToken headerAuth is:')
    console.log(headerAuth)
    if (!headerAuth) return res.status(401).send({ status: 'error', error: 'Not Autorized' })
    //Aplicamos split porque viene como 'Bearer {id}', con el split en el espacio queda solo el string id.
    const token = headerAuth.split(' ')[1]

    jwt.verify(token, KEY, (error, credentials) => {
        console.log(error)
        if (error) return res.status(401).send({ status: 'error', error: 'Not autorized second check.' })
        req.user = credentials.user
        next()
    })
}
//--------------------------TerminaJson Web Token, log 18.08

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;