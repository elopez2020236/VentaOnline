const Categoria = require('../models/categoria.model')
const Producto = require('../models/producto.model')
const Usuario = require('../models/usuario.model')



function crearCategoria(req, res) {
    const categoria = new Categoria();
    const params = req.body
    const rol = req.user.rol


    crearCategoriaDefecto();


    if(rol != 'ROL_ADMIN') return res.send({ message: 'No tienen permiso de crear categorias' })

        if(params.nombreCategoria){
           
            categoria.nombreCategoria = params.nombreCategoria,
    
            Categoria.find({ $and: [
                {nombreCategoria: params.nombreCategoria}
            ]}).exec((err, categorias) => {
                if(err) return res.status(500).send({message}).send({message: 'Error en la peticion de categorias'})
                if(categorias && categorias.length >= 1){
                    return res.status(500).send({message: 'Esta categoria ya existe'})
                }else{
                        
                        categoria.save((err, categoriaGuardada) => {
                            if(err) return res.status(500).send({message: 'error al guardar la categoria'})
                            if(categoriaGuardada){
                                res.status(200).send({categoria: categoriaGuardada})
                            }else{
                                res.status(404).send({message: 'no se ha podido registrar la categoria'})
                            }
                            
                        })
                    
                }
            })
        }else{
            res.status(200).send({message: 'Escriba la categoria'})
        }
}


function crearCategoriaDefecto() {
    const categoria = new Categoria();
    categoria.nombreCategoria = "Categoria Por Defecto"

    Categoria.countDocuments({nombreCategoria: 'Categoria Por Defecto'}, (err, categoriaDefault)=>{
     if(categoriaDefault == 0){
        categoria.save()
     }
    })
}


function controlCategorias(req, res) {

    Categoria.find({}, (err, categoriasEncontradas)=>{
        if(err) return res.status(500).send({ message: 'error en la petición de categorias' })
        if(!categoriasEncontradas) return res.status(404).send({ message: 'Error al listar las categorias' })
        return res.status(200).send({ categoriasEncontradas })
    })
}

function eliminarCategoria(req, res) {
    const categoriaId = req.params.id;

        if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'No tienes permiso para eliminar la categoria' })
        Categoria.findById(categoriaId, (err, categoriaEcontrada)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de categorias' })
            if(!categoriaEcontrada) return res.status(404).send({ message: 'Error al listar las categorias' })
            Categoria.findByIdAndDelete(categoriaEcontrada._id, (err, categoriaEliminada)=>{
                if(err) return res.status(500).send({ message: 'error al eliminar la categoria' })
                if(!categoriaEliminada) return res.status(404).send({ message: 'No se ha podido eliminar la categoría' })

                    Categoria.findOne({nombreCategoria: "Categoria Por Defecto"}, (err, defaultCategoryCreated)=>{
                        Producto.updateMany({categoria: categoriaId}, {categoria: defaultCategoryCreated._id}).exec();
                        return res.status(200).send({ message: 'categoria eliminada' })
                    })
            })
        })
    
}




function editarCategoria(req, res) {
    const datos = req.body;
    
    const categoriaId = req.params.id;

    if(req.user.rol != 'ROL_ADMIN') return res.send({ message: 'no tienes permiso de editar categorias' })

        Categoria.findById(categoriaId, (err, categoriaEcontrada)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de categorias' })
            if(!categoriaEcontrada) return res.status(404).send({ message: 'error al listar las categorias' })
            Categoria.findByIdAndUpdate(categoriaEcontrada._id, datos, {new: true}, (err, categoriaActualizada)=>{
                if(err) return res.status(500).send({ message: 'error al actualizar la categoria' })
                return res.status(200).send({ categoriaActualizada })
            })
        })
   
}



module.exports={
    crearCategoria,
    eliminarCategoria,
    editarCategoria,
    crearCategoriaDefecto,
    controlCategorias
}
