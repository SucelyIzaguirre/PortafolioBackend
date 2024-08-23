const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

//database
require('../db');

//config
app.set('PORT', process.env.PORT | 5000);

app.use(cors());

//middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
// Middleware para servir archivos estáticos (imágenes públicas)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Configuración de rutas
app.use(express.json());

//routes
app.use('/api', require('../routes'));

module.exports = app;