const express = require('express'); //Cargar framework de nodejs
const router = express.Router(); //Cargar nucleo router

//Importar controlador de payouts
const paypal_controller = require
('../controllers/paypal.controller');

module.exports = function(){

    //Estas son tus rutas y obtienen la funcionalidad del controlador asignado
    //Tus rutas se ven asi ej: http://localhost:2777/api/paypal/paypal-new-checkout
    router.get('/paypal-token', paypal_controller.generarTokenPaypal);
    router.post('/paypal-new-checkout', paypal_controller.generarPayoutPaypal);

    return router;
}