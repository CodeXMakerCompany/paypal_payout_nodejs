const express = require('express');
const routes = require('./routes'); //Rutas
const path = require('path'); //Cargar ruta de archivos
const bodyParser = require('body-parser');//Cargar lector de formularios

// Crear una app de express
const app = express();

//Habilitar body parser para leer datos de formularios esto es un midleware asi que debe ir antes de las rutas
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Cargar rutas
app.use('/api/paypal', routes());

//Puesto para la api
app.listen(2777);

//Todas tus rutas comenzaran asi 
//http://localhost:2777/api/paypal/