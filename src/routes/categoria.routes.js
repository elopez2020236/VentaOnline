const express = require("express")
const CategoriaController = require("../controllers/categoria.controller")
const md_autenticacion = require('../middlewares/autenticacion');


const api = express.Router();

api.post('/crearCategoria', md_autenticacion.Auth, CategoriaController.crearCategoria)
api.delete('/eliminarCategoria/:id', md_autenticacion.Auth, CategoriaController.eliminarCategoria)
api.put('/editarCategoria/:id', md_autenticacion.Auth, CategoriaController.editarCategoria)
api.get('/controlCategorias', CategoriaController.controlCategorias)

module.exports = api;