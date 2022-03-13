const express = require('express');
const cors = require('cors');
const app = express();



const usuarioRoutes = require('./src/routes/usuario.routes');
const categoriaRoutes = require('./src/routes/categoria.routes');
const productoRoutes = require('./src/routes/producto.routes');



app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', usuarioRoutes, categoriaRoutes, productoRoutes);

module.exports = app;