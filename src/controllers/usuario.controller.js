const Usuario = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

const Producto = require('../models/producto.model')
const Factura = require('../models/factura.model')
const path = require('path')
const fs = require('fs')
const pdf = require("pdfkit")

//-------------------------------------------------------------------admin
function RegistrarAdministrador(req, res) {
    var usuarioModel = new Usuario();

    Usuario.find({ rol: 'ROL_ADMIN' }, (err, usuarioEncontrado) => {
        if (usuarioEncontrado.length > 0) {
            return console.log({ mensaje: "Ya existe el ADMIN" })
        } else {
            usuarioModel.nombre = 'ADMIN';
            usuarioModel.email = 'ADMIN';
            usuarioModel.rol = 'ROL_ADMIN';
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                    if (err) console.log({ mensaje: 'Error en la peticion' });
                    if (!usuarioGuardado) return console.log({ mensaje: 'Error al agregar' });

                    return console.log({ usuario: usuarioGuardado });
                });
            });
        }
    })

}

//--------------------------LOGIN

function Login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ email: parametros.email }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (usuarioEncontrado) {
            bcrypt.compare(parametros.password, usuarioEncontrado.password,
                (err, verificacionPassword) => {
                    if (verificacionPassword) {
                        return res.status(200)
                            .send({ token: jwt.crearToken(usuarioEncontrado) })
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'La contrasena no coincide.' })
                    }
                })
        } else {
            return res.status(500)
                .send({ mensaje: 'El usuario, no se ha podido identificar' })
        }
    })
}





//------------------------------------------usuario

function AgregarUsuario(req, res) {
    var parametros = req.body;
    var modeloUsuario = new Usuario();

    if (parametros.nombre && parametros.email && parametros.rol && parametros.password) {
        Usuario.find({ email: parametros.email }, (err, usuarioEncontrado) => {
            if (usuarioEncontrado.length > 0) {
                return res.status(500).send({ mensaje: "este correo ya se encuentra utilizado" })
            } else {
                modeloUsuario.nombre = parametros.nombre;
                modeloUsuario.email = parametros.email;
                modeloUsuario.rol = parametros.rol;
                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    modeloUsuario.password = passwordEncriptada;

                    modeloUsuario.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!usuarioGuardado) return res.status(500).send({ mensaje: 'Error al guardar el usuario' })

                        return res.status(200).send({ usuario: usuarioGuardado })
                    })
                })
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Debe ingresar los parametros obligatorios' })
    }
}



function EditarUsuario(req, res){
    var userId = req.user.sub
    var params = req.body

    delete params.rol
    delete params.password


    User.findByIdAndUpdate(userId, params, {new: true}, (err, usuarioActualizado) =>{
        if(err) return res.status(500).send({ message: 'error en la peticion' })
        if(!usuarioActualizado) return res.status(404).send({ message: 'no se ha podido editar el usuario' })
        return res.status(200).send({ user: usuarioActualizado })
    })
}



function EliminarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;

    if (req.user.rol !== 'ROL_ADMIN') return res.status(500)
        .send({ mensaje: 'Solo el admin puede eliminar' });

    Usuario.findByIdAndDelete(req.params.idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el usuario' })

        return res.status(200).send({ usuario: usuarioEliminado });
    })
}


function obtenerUsuario(req, res) {
    Usuario.findById(req.user.sub, (err, usuarioEncontrado) => {
        let tabla = []
        for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
            tabla.push(`${usuarioEncontrado.carrito[i].nombreProducto} Q.${usuarioEncontrado.carrito[i].precioUnitario}.00`)
        }

        return res.status(200).send({ datosImpresos: tabla })
    })
}
//--------------------------------------------------------------------------------------------------------------cliente
//--------------------------------REGISTRAR CLIENTE

function RegistrarCliente(req, res) {
    var parametros = req.body;
    var modeloUsuario = new Usuario();

    if (parametros.nombre && parametros.apellido && parametros.email
        && parametros.password) {
        Usuario.find({ email: parametros.email }, (err, usuarioEncontrados) => {
            if (usuarioEncontrados.length > 0) {
                return res.status(500)
                    .send({ mensaje: "Este correo ya se encuentra utilizado" })
            } else {
                modeloUsuario.nombre = parametros.nombre;
                modeloUsuario.apellido = parametros.apellido;
                modeloUsuario.email = parametros.email;
                modeloUsuario.rol = 'ROL_CLIENTE';
                modeloUsuario.imagen = null;
                modeloUsuario.totalCarrito = 0;

                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    modeloUsuario.password = passwordEncriptada;

                    modeloUsuario.save((err, usuarioGuardado) => {
                        if (err) return res.status(500)
                            .send({ mensaje: 'Error en la peticion' })
                        if (!usuarioGuardado) return res.status(500)
                            .send({ mensaje: 'Error al guardar el Usuario' })

                        return res.status(200).send({ usuario: usuarioGuardado })
                    })
                })
            }
        })
    } else {
        return res.status(404)
            .send({ mensaje: 'Debe ingresar los parametros obligatorios' })
    }

}


function EditarCliente(req, res) {
    var parametros = req.body;

    if (req.user.rol !== 'ROL_CLIENTE') return res.status(500)
        .send({ mensaje: 'Solo el cliente puede editar' });

    delete parametros.password

    Usuario.findByIdAndUpdate(req.params.idUsuario, parametros, { new: true }, (err, usuarioActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar' });

        return res.status(200).send({ usuario: usuarioActualizado })
    })

}



function EliminarCliente(req, res) {
    var idUsuario = req.params.idUsuario;

    if (req.user.rol !== 'ROL_CLIENTE') return res.status(500)
        .send({ mensaje: 'Solo el cliente puede eliminar' });

    Usuario.findByIdAndDelete(req.params.idUsuario, (err, usuarioEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioEliminado) return res.status(500)
            .send({ mensaje: 'Error al eliminar el usuario' })

        return res.status(200).send({ usuario: usuarioEliminado });
    })
}
//-----------------------------------------------carrito


function añadirCarrito(req, res) {
    var productoId = req.body.productoId
    var cantidad = req.body.cantidad
    
    if(req.user.rol != 'ROL_CLIENTE') return res.send({ message: 'No puedes añadir productos a tu carrito' })
    Producto.findById(productoId, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de productos' })
        if(!productoEncontrado) return res.status(404).send({ message: 'error al buscar los productos' })
        
        Usuario.countDocuments({_id: req.user.sub, "carrito.codigoProducto": productoId}, (err, productoYaRegistrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de usuarios' })
     
            if(productoYaRegistrado == 0){
                if(productoEncontrado.stock < cantidad) return res.send({ message: 'No hay unidades suficientes de este producto' })
                Usuario.findByIdAndUpdate(req.user.sub, { $push: { carrito: { nombreProducto: productoEncontrado.nombreProducto, cantidad: cantidad,
                     precio: productoEncontrado.precio, codigoProducto: productoEncontrado._id, total: productoEncontrado.precio * cantidad } } }, 
                     {new: true}, (err, carritoActualizado) =>{productoEncontrado
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!carritoActualizado) return res.status(404).send({ message: 'error al agregar el producto a la sucursal' })
                    return res.status(200).send({ carritoActualizado })
                })
            }else{
                Usuario.findOne({_id: req.user.sub, "carrito.codigoProducto": productoId}, {"carrito.$.cantidad": 1, _id: 0}, (err, cantidadProductoEncontrado)=>{
                   if("carrito.$.cantidad">1) return res.status(500).send({mensaje: 'La cantidad del carrito solo puede ser 1'})
                    const cantidadTotal = cantidadProductoEncontrado.carrito[0].cantidad + Number(cantidad)
                    const precioAnterior =  cantidadProductoEncontrado.carrito[0].precio * cantidad
                    
                    
                if(cantidadTotal > productoEncontrado.stock) return res.send({ message:'no hay suficient stock' })




                  Usuario.updateOne({_id: req.user.sub, carrito: {$elemMatch: {codigoProducto: productoId}}},
                     {$inc:{"carrito.$.cantidad": cantidad ,"carrito.$.total": precioAnterior}}, (err, cantidadIncrementada)=>{
                    if(err) return res.status(500).send({ message: 'Error en la peticion de usuario' })
                    if(!cantidadIncrementada) return res.status(404).send({ message: 'error al actualizar el producto' })
                    Usuario.findById(req.user.sub, (err, usuarioEncontrado)=>{
                        return res.status(200).send({ usuarioEncontrado })
                    })
                })
                })
                
            }
        })
    })
}


//------------------------------------------factura


function agregarProductosFactura(datos, res) {
    Usuario.findById(datos.user, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ message: 'error en la petición de usuarios' })
        if (!usuarioEncontrado) return res.status(404).send({ message: 'error al listar los usuarios' })

        for (let x = 0; x < usuarioEncontrado.carrito.length; x++) {
            var compras = usuarioEncontrado.carrito[x]
            var cantidadRestar = compras.cantidad
            Producto.updateOne({ _id: compras.codigoProducto }, { $inc: { stock: -cantidadRestar } }).exec();
            Producto.updateOne({ _id: compras.codigoProducto }, { $inc: { unidadesVendidas: cantidadRestar } }).exec();

            Factura.findByIdAndUpdate(datos._id, { $push: { compra: compras } }, (err, facturaActualizada) => {
                if (err) return res.status(500).send({ message: 'error en la petición' })
                if (!facturaActualizada) return res.status(404).send({ message: 'error al actualizar' })
            })
        }

        Factura.findById(datos._id, (err, facturaEncontrada) => {
            eliminarCarrito(datos.user, res);
            return res.status(200).send({ factura: facturaEncontrada })
        })
    })
}

function eliminarCarrito(datosUsuario, res) {
    Usuario.findByIdAndUpdate(datosUsuario, { carrito: [] }).exec()
}

function facturasUsuario(req, res) {
    var usuarioId = req.body.usuarioId;

    if (req.user.rol != 'ROL_ADMIN') return res.send({ message: 'No tienes permiso de ver las facturas de los usuarios' })

    Factura.find({ usuario: usuarioId }, (err, facturasEncontradas) => {
        if (err) return res.status(500).send({ message: 'Error en la petición de facturas' })
        if (!facturasEncontradas) return res.status(404).send({ message: 'error al listar las facturas' })
        if (facturasEncontradas.length == 0) return res.send({ message: 'El cliente no tiene facturas' })

        return res.status(200).send({ facturas: facturasEncontradas })
    })

}

function productoXFactura(req, res) {
    var serieFactura = req.body.NoSerie;

    if (req.user.rol != 'ROL_ADMIN') return res.send({ message: 'No tienes permiso para realizar esta accion' })

    Factura.findOne({ NoSerie: serieFactura }, { compra: 1, _id: 0 }, (err, productosFactura) => {
        if (err) return res.status(500).send({ message: 'error en la petición de facturas' })
        if (!productosFactura) return res.status(404).send({ message: 'No se ha encontrado la factura' })
        return res.status(200).send({ productosFactura })
    })
}





function facturaDetallada(req, res) {
    var factura = new Factura();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    factura.empresa = "MACDONAL"
    factura.fecha = mm + '/' + dd + '/' + yyyy
    var serie = 1

    Usuario.findById(req.user.sub, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' })
        if (!usuarioEncontrado) return res.status(404).send({ message: 'error al listar los usuarios' })
        if (usuarioEncontrado.rol != 'ROL_CLIENTE') return res.send({ message: 'NO puedes añadir una administrador a la factura' })
        if (usuarioEncontrado.carrito.length == 0) return res.send({ message: 'No tienes productos en el carrito' })
        Factura.countDocuments({}, (err, cantidadFacturas) => {
            serie = serie + cantidadFacturas
            factura.NoSerie = serie
            factura.user = usuarioEncontrado._id;
            factura.save((err, facturaCreada) => {
                if (err) return res.status(500).send({ message: 'error al crear el empleado' })
                if (!facturaCreada) return res.status(404).send({ message: 'no se ha podido crear la factura' })
                agregarProductosFactura(facturaCreada, res);
            })
        })
    })


}

/*function eliminarCarrito(req, res){
    var logeado = req.user;
    var parametros = req.body;
    
    Usuario.findOne({_id:logeado.sub, "carrito.producto": parametros.producto},( err,carritoEncotrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en  la peticion del carrito'})
        if(carritoEncotrado !== 00){
            Usuario.findOneAndUpdate({_id:logeado.sub, carrito : { $elemMatch : {producto:parametros.producto } } }, 
                { $pull : { carrito : { producto:parametros.producto} } }, {new : true}, (err, prodEliminado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                    if(!prodEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el producto del carrito'});
                    
                    let totalLocal = 0;
                    for(let i = 0; i < prodEliminado.carrito.length; i++){
                        totalLocal += prodEliminado.carrito[i].subtotal;
                    }
        
                    Usuario.findByIdAndUpdate(logeado.sub, { totalCarrito: totalLocal }, {new : true}, (err, carritoAgregado)=>{
                            if(err) return res.status(500).send({ mensaje: 'Error en  la peticion del Carrito'});
                            if(!carritoAgregado) return res.status(500).send({ mensaje: 'Error al actualizar el total del carrito'});
        
                            return res.status(200).send({ Eliminado_Carrito:  carritoAgregado})
                        })
                    
                })

        }})

    
}*/


module.exports = {
    RegistrarCliente,
    Login,
    RegistrarAdministrador,
    EditarUsuario,
    EliminarUsuario,
    obtenerUsuario,
    EditarCliente,
    EliminarCliente,
    añadirCarrito,
    agregarProductosFactura,
    facturasUsuario,
    productoXFactura,
    facturaDetallada,
    AgregarUsuario

}