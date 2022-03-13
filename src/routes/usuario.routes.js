const express = require('express');
const controladorUsuario = require('../controllers/usuario.controller');

const md_autenticacion = require('../middlewares/autenticacion');

 

const api = express.Router();

api.post('/RegistrarAdministrador', controladorUsuario.RegistrarAdministrador);
api.post('/login', controladorUsuario.Login);
api.post('/AgregarUsuario', md_autenticacion.Auth,controladorUsuario.AgregarUsuario);

api.post('/RegistrarCliente', controladorUsuario.RegistrarCliente);
api.delete('/EliminarUsuario/:idUsuario', md_autenticacion.Auth,controladorUsuario.EliminarUsuario);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth, controladorUsuario.EditarUsuario);
api.get('/obtenerUsuario', md_autenticacion.Auth, controladorUsuario.obtenerUsuario)
api.delete('/EliminarCliente/:idUsuario', md_autenticacion.Auth,controladorUsuario.EliminarCliente);
api.put('/editarCliente/:idUsuario', md_autenticacion.Auth, controladorUsuario.EditarCliente);

// Carrito
api.put('/agregarCarrito', md_autenticacion.Auth, controladorUsuario.añadirCarrito);
//api.put('/comprar', md_autenticacion.Auth, controladorUsuario.comprar)


//-------------------------
api.put('/facturaDetallada', md_autenticacion.Auth, controladorUsuario.facturaDetallada)
api.get('/facturasCliente', md_autenticacion.Auth, controladorUsuario.facturasUsuario)
api.get('/productosXfactura', md_autenticacion.Auth, controladorUsuario.productoXFactura)


module.exports = api;