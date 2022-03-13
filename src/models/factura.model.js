var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    fecha: Date,
    compra: [{
        nombreProducto: String,
        cantidad: Number,
        precio: Number,
        codigoProducto: { type: Schema.ObjectId, ref: 'producto' },
        total: Number
    }],
    usuario: { type: Schema.ObjectId, ref: 'usuario' },
})

module.exports = mongoose.model('factura', FacturaSchema)