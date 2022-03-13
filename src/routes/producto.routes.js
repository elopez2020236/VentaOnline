const express = require("express")
const ProductoController = require("../controllers/producto.controller")
const md_autenticacion = require('../middlewares/autenticacion');



const api = express.Router();


api.post('/crearProducto', md_autenticacion.Auth, ProductoController.crearProducto)
api.put('/editarProducto/:id', md_autenticacion.Auth, ProductoController.editarProducto)
api.delete('/eliminarProducto/:id', md_autenticacion.Auth, ProductoController.eliminarProducto)
api.get('/controlProductos', ProductoController.controlProductos)
api.get('/BusquedaNombre/', ProductoController.BusquedaNombre)
api.put('/stock/:idProducto', ProductoController.stock);
api.get('/productosAgotados', md_autenticacion.Auth, ProductoController.ProductosAgotados)
api.get('/buscarProductoCategoria', md_autenticacion.Auth, ProductoController.buscarProductoCategoria)
api.get('/productosMasVendidos', md_autenticacion.Auth, ProductoController.productosMasVendidos)


module.exports = api;