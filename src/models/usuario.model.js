var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    nombre: String,
    usuario: String,
    email: String,
    password: String,
    rol: String,
    carrito: [{
        nombreProducto: String,
        cantidad: Number,
        precio: Number,
        codigoProducto: { type: Schema.ObjectId, ref: 'producto' },
        total: Number
    }],
})

module.exports = mongoose.model('usuario', UsuarioSchema);