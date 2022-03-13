const Producto = require('../models/producto.model')
const Categoria = require('../models/categoria.model')

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt')

function crearProducto(req, res){
    const producto = new Producto();
    const params = req.body;

    if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'no tienes permisos para registrar un producto' })

    if(params.nombreProducto && params.stock && params.precio && params.idCategoria){
        producto.nombreProducto = params.nombreProducto
        producto.stock = params.stock
        producto.precio = params.precio
        producto.categoria = params.idCategoria

        Producto.find().exec((err, products) => {
            if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de productos'})
            if(products && products.length >= 9){
                return res.status(500).send({message: 'el producto ya existe'})
            }else{

                Categoria.findById(producto.categoria, (err, categoriaEncontrada)=>{
                    if(err) return res.status(500).send({ message: 'error en la petición de categorias' })
                    if(!categoriaEncontrada) return res.status(404).send({ message: 'no se ha encontrado la categoria' })
                    producto.save((err, productoGuardado) => {
                        if(err) return res.status(500).send({message: 'error al guardar el producto'})
                        if(productoGuardado){
                            res.status(200).send({producto: productoGuardado})
                        }else{
                            res.status(404).send({message: 'no se ha guardar el producto'})
                        }
                        
                    })
                })
                
            }
        })
        
    }else{
        res.status(200).send({
            message: 'faltan datos'
        })
    }
}



function eliminarProducto(req, res) {
    var idProducto = req.params.id;

    if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'NO tienes permiso para eliminar productos' })
    Producto.findByIdAndDelete(idProducto, (err, productoEliminado)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de productos' })
        if(!productoEliminado) return res.status(404).send({message: 'error al eliminar el producto' })
        return res.status(200).send({ message: 'Producto Eliminado' })
    })
}


function editarProducto(req, res) {
    const idProducto = req.params.id;
    const datos = req.body;
    const categoria = req.body.idCategoria
    
    if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'no tienes permiso para editar productos' })
    
        if(categoria){
            Categoria.findById(datos.idCategoria, (err, categoriaEncontrada)=>{
                if(err) return res.status(500).send({ message: 'error en la peticion de categorias' })
                if(!categoriaEncontrada) return res.status(404).send({ message: 'no se ha encontrado la categoria' })
            })
        }else{
            Producto.findByIdAndUpdate(idProducto, {nombreProducto: datos.nombreProducto, 
                $inc:{stock: datos.stock}, precio: datos.precio, categoria: datos.idCategoria}, 
                {new: true}, (err, productoActualizado)=>{
                if(err) //{
                   // console.log(err)
                   // return err
              //  } 
              return  res.status(500).send({ message: 'error en la petición de productos' })
                if(!productoActualizado) return res.status(404).send({ message: 'error al editar el producto' })
                return res.status(200).send({ productoActualizado })
            })
        }
        
}



function controlProductos(req, res) {
    const idProducto = req.body.idProducto;
    const idCategoria = req.body.idCategoria;

    if(idProducto && idCategoria){
        return res.send({ message: 'Busca de una sola manera' })
    }else if(idProducto){
        Producto.findById(idProducto, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la petición de productos' })
            if(!productoEncontrado) return res.status(404).send({ message: 'error al listar el producto' })
            return res.status(200).send(productoEncontrado)
        })
    }else if(idCategoria){
        Producto.find({categoria: idCategoria}, (err, productosEncontrados)=>{
            if(err) return res.status(500).send({ message: 'Error en la petición de productos' })
            if(!productosEncontrados) return res.status(404).send({ message: 'Error al listar los productos' })
            return res.status(200).send({ productosEncontrados })
        })
    }else{
        Producto.find({}, (err, productosEncontrados)=>{
            if(err) return res.status(500).send({ message: 'error en la petición de productos' })
            if(!productosEncontrados) return res.status(404).send({ message: 'error al listar los productos' })
            return res.status(200).send({ productosEncontrados })
        })
    }
}

function stock(req, res) {
    const id = req.params.idProducto;
    const parametros = req.body;

    Producto.findByIdAndUpdate(id, { $inc: { stock: parametros.stock } }, { new: true },
        (err, stockModificado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!stockModificado) return res.status(500).send({ mensaje: 'Error incrementar la cantidad del producto' });
            return res.status(200).send({
                producto: stockModificado
            })
        })
}




function BusquedaNombre(req, res) {
    const parametro = req.body.nombreProducto;

    Producto.find(
        {nombreProducto: {$regex: parametro, $options: "i"}} , (err, productosEncontrados)=>{
        if(err) return res.status(500).send({ message: 'error en la peticion de Productos' })
        if(!productosEncontrados) return res.status(404).send({ message: 'no se han podido buscar los productos' })
     
                return res.status(200).send({productos: productosEncontrados})
            

    })
}


function buscarProductoCategoria(req, res) {
    const parametro = req.body.nombreCategoria
    Producto.find({nombreCategoria: {$regex:parametro, $options: "i"}}, (err, productosEncontrados)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la petición' })
            if(!productosEncontrados) return res.status(500).send({mensaje: 'Error al buscar productos'})
            return res.status(200).send({mensaje: productosEncontrados})

})
}

function productosMasVendidos(req, res) {
    if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'Error al ejecutar' })

    Producto.find({}).sort({unidadesVendidas: -1}).exec((err, productosMasVendidos)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de productos' })
        if(!productosMasVendidos) return res.status(404).send({ message: 'error al buscar los productos' })
        return res.status(200).send({ productos: productosMasVendidos })
    })
}

function ProductosAgotados(req,res){
    Producto.find({stock: 0},(err, ProductosAgotados)=>{
        if(err) return res.status(500).send({message: "Error al buscar productos agotados"});
         if(ProductosAgotados){
            if(ProductosAgotados != ""){
                return res.send({message: "Productos agotados: ", ProductosAgotados});
            }else{
                return res.status(404).send({message: "Por el momento no hay productos agotados"});
            }
        }else{
            return res.status(404).send({message: "Por el momento no hay productos agotados"});
        }
    })
}


module.exports={
    crearProducto,
    editarProducto,
    eliminarProducto,
    controlProductos,
    BusquedaNombre,
    stock,
    ProductosAgotados,
    buscarProductoCategoria,
    
    productosMasVendidos
}