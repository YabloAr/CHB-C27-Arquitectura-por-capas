//Este archivo, manejar los parametros de entrada y envio de middlewares, y la tarea y el proceso en si, sucede en el app.router
import AppRouter from '../app.router.js'
import ProductManager from "../../dao/dbManagers/productsManager.js"
import productModel from '../../dao/models/products.js';

const manager = new ProductManager()

export default class ProductsRouter extends AppRouter {
    init() {
        //GET PRODUCTS CON QUERY PARAMS
        this.get('/', async (req, res) => {
            try {
                const sort = parseInt(req.query.sort) || -1;
                const category = req.query.category || "";
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;

                const skip = (page - 1) * limit;
                const categoryStage = category ? { category: category } : {};

                //pipeline para contar cantidad y poder paginar.
                const countPipeline = [
                    { $match: categoryStage },
                    { $match: { stock: { $gt: 0 } } }, //$gt = 'greater than'
                    { $count: 'totalCount' }
                ]

                //totalCategoryCount, ejecuta la countPipeline el formato de devolucion
                //es el siguiente [ {"_id": null,"count": <number>  }]
                //como esta desestructurado, el formato seria el siguiente: {"_id": null,"count": <number>  }
                //se puede acceder al resutado con totalCategoryCount.length() (aunque no tenga sentido)
                const [totalCategoryCount] = await productModel.aggregate(countPipeline).exec();
                const totalProductCount = totalCategoryCount ? totalCategoryCount.totalCount : 0

                //resultPipeline, esta es la pipeline que nos va a dar todos los valores que tenemos que devolver.
                const resultPipeline = [
                    { $match: categoryStage },
                    { $match: { stock: { $gt: 0 } } },
                    { $sort: { price: sort } },
                    { $skip: skip },
                    { $limit: limit }
                ]

                //Lista final de productos
                const resultProducts = await productModel.aggregate(resultPipeline).exec()

                //paginacion mediante booleanos
                const hasNextPage = skip + resultProducts.length < totalProductCount; //booleano
                const hasPrevPage = page > 1; //booleano


                const response = {
                    status: 'Available? Nose que deberia salir de status...',
                    payload: resultProducts,
                    totalPages: Math.ceil(totalProductCount / limit),
                    prevPage: hasPrevPage ? page - 1 : null,
                    nextPage: hasNextPage ? page + 1 : null,
                    page: page,
                    hasPrevPage,
                    hasNextPage, //mira donde me hace poner los links, te odio coder.
                    prevLink: hasPrevPage ? `/api/products?category=${category}&page=${page - 1}&limit=${limit}&sort=${sort}` : null,
                    nextLink: hasNextPage ? `/api/products?category=${category}&page=${page + 1}&limit=${limit}&sort=${sort}` : null,
                }
                //desde los primeros monos comiendo hongos y lamiendo sapos hasta chatGPT, todo valio la pena. GPT( •_•)>⌐■-■
                res.send(response)

            } catch (error) { //
                console.log(`product.router get failed, catch is ${error.message}`);
                res.status(500).send({ status: "error", message: error.message });
            }
        })

        //POST PRODUCT
        this.post('/', async (req, res) => {
            try {
                const thisProduct = req.body;
                const isProductValid = this.checkProductValues(thisProduct);

                if (isProductValid) {
                    const addStatus = await manager.saveProduct(thisProduct);

                    if (addStatus.status === 'Success.') {
                        return res.send(addStatus);
                    }
                    console.log('Product Router Post, failed try/catch.');
                    return res.send(addStatus);
                }

                console.log('productRouter.post failed, check data.');
                res.send({ status: 'Error', message: 'Check product values.' });
            } catch (error) {
                console.log(`POST Products try failed, catch error: ${error.message}`);
                return { status: 500, error: `product.router get failed, catch is ${error.message}` }
            }
        })

        //GET BY ID
        this.get('/:pid', async (req, res) => {
            try {
                let pid = req.params.pid
                const result = await manager.getProductById(pid)
                if (result) {
                    res.send(result)
                } else {
                    res.send({ status: 'Error', message: `GET Product/:pid failed, id not found.` })
                }
            } catch (error) {
                console.log(`GET Products by id try failed, catch error: ${error.message}`);
                return { status: 500, error: `product.router get by id failed, catch is ${error.message}` }
            }
        })

        //UPDATE PRODUCT
        this.put('/:pid', async (req, res) => {
            try {
                const newData = req.body
                const pid = req.params.pid
                const foundProduct = await manager.getProductById(pid)
                if (foundProduct) {

                    const result = await manager.updateProduct(pid, newData)
                    if (result.status === "Success.") {
                        res.send(result)
                    } else {
                        res.send({ status: "Error.", message: `Product Router Put failed.` })
                    }

                } else { res.send({ status: "Failed", message: `Router Put failed, product id not found in database.` }) }
            } catch (error) {
                console.log(`PUT Products try failed, catch is ${error.message}`)
                res.send({ status: "error", message: "Router catched an error." })
            }
        })

        //DELETE PRODUCT
        this.delete('/:pid', async (req, res) => {
            try {
                const pid = req.params.pid;
                const foundProduct = await manager.getProductById(pid);

                if (foundProduct) {
                    const result = await manager.deleteProduct(pid);
                    res.send(result);
                } else {
                    res.send({ error: 'Router Delete failed, id not found.' });
                }
            } catch (error) {
                console.log(`DELETE Product try failed, catch is ${error.message}`)
                res.send({ status: 'Error', message: error.message });
            }
        })
    }
}