'use strict';
//Load files library
var fs = require('fs');
var path = require('path');

const axios = require('axios');//Libreria para manejar servicios rest complejos
const http  = require('https');//Librerias para manejar ser rest
const uniqid = require('uniqid');//Genera ids unicos

//Esta var se exporta como un modulo para las rutas
var controller = {
    
    //Funcionalidad que genera un token de paypal
    generarTokenPaypal: async function(req, res ){

        console.log('Ruta activada');
      //Estos datos se pasan a las cabeceras de auth basic para generar el token
      //basic es una auth compleja asi que implemente axios para sacar los datios
      //con desestructuracion de datos
      //username = clientid, password = secret  
      let username = 'Ae6U99J0_C1i33YF9pmwflyXVVgYDW0ao6Ss1k5pGRpM-KnE9vIaNf9P2-eGglPPVCwIW4ZhfsX2EjUQ';
      let password = 'EKTKeAvsnWPcuwuOY0vq4R3Si7lWYTJszmRB3tqM-m0LnvMmbFWC51zTRBwjO5m882_nYKGOnJuPdlTg';
    
      //Funcion para peticion a la api de paypal
      (async () => {
        try {
          const { data: { access_token, token_type } } = await axios({ //desestruc de datos par aobtener access_token
            url: 'https://api.sandbox.paypal.com/v1/oauth2/token',//cambiar esta url en produccion https://api.paypal.com
            method: 'post',
            headers: {
              Accept: 'application/json',
              'Accept-Language': 'en_US',
              'content-type': 'application/x-www-form-urlencoded',
            },
            auth: {
              username: username,//tu username es tu client id
              password: password,//tu password es tu secret
            },
            params: {
              grant_type: 'client_credentials',
            },
          });
          
          //Devolver respuesta con el token
          return res.status(200).send({
            status : 'success',  
            message: "Su token es:",
            access_token : access_token,
            token_type   : token_type
          });
    
        } catch (error) { 
          console.log('error: ', error);
          
          //Sila peticion axios fallo
          return res.status(400).send({
            status : 'error',  
            message: "Error de paypal, revisar logs"
          });
    
        }
      })();
    
    },

    generarPayoutPaypal: async function(req, res){

        //Params son los paremtros que recibe el cuerpo de la peticion
        let params     = req.body;//aqui tambien viene el token
        let modo       = params.modo;//modo debne ser EMAIL, TELEFONO, PAYPAL ID
        //Dependiendo esta la logica de la peticion cambiara
        let batch_code = uniqid(); //Este codigo lo genere por que cada peticion 
        //te pide generar cun numero de factuiracion unico con esta libreria lo hacemos

        //Esto viene de la doc de paypal
        //Importante aqui debes poner en authorizathion : "Bearer " + params.token para poner el token nuevo que se genera cada 
        //peticion
        var options = {
          "method": "POST",
          "hostname": "api.sandbox.paypal.com",
          "port": null,
          "path": "/v1/payments/payouts",
          "headers": {
            "accept": "application/json",
            "authorization": "Bearer A21AAERjcBQngNarsSHs5cao8vpjDKkkHvH_TFLxO5syy_ruOuzFAsryryDG6R6WDTLavbCsB8AcS4ebtG_UtM6xWgQ3zkS3g",
            "content-type": "application/json"
          }
        };
        
        //Doc payouts paypal
        //Handler de request a su api
        //INCIO PETICION
        var req = http.request(options, function (res) {
          var chunks = [];
        
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
        
          res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());//Esto te imprime tu respuesta
          });
        });
        
        //Si modo es tipo EMAIL
        if (modo == 'EMAIL') {
            
            let email          = params.email;//destinatario
            let monto_a_cobrar = params.value;//lo que pagaras

            req.write(JSON.stringify({ sender_batch_header:
                { email_subject: 'Pago realizado',
                  sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
               items:
                [ 
                 
                  { recipient_type: 'EMAIL',//actualmente usando
                    amount: { value: monto_a_cobrar, currency: 'USD' },
                    receiver: email,
                    note: 'Pago desde el backend con node, token working'
                  },
                 
                ] }));
             req.end();//FIN DE PETICION
             
             //regresar respuesta al front
             return res.status(200).send({
                status : 'success',
                message: "Pago realizado a: " +email
              });
        }
        //Si modo es tipo TELEFONO
        if (modo == 'TELEFONO') {
            
            let telefono       = params.telefono;
            let monto_a_cobrar = params.value;

            req.write(JSON.stringify({ sender_batch_header:
                { email_subject: 'Pago realizado',
                  sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
               items:
                [ 
                  { recipient_type: 'PHONE',//portelefono
                    amount: { value: monto_a_cobrar, currency: 'USD' },
                    receiver: telefono,
                    note: 'Pago a usuario por telefono',//poremail
                    sender_item_id: 'item-1-1589160337416' 
                  },

                ] }));
             req.end();
             
             
             return res.status(200).send({
                status : 'success',
                message: "Pago realizado a: " + telefono
              });
        }
        //Si modo es tipo PAYPAL_ID
        if (modo == 'PAYPAL_ID') {
            
            let paypal_id      = params.paypal_id;
            let monto_a_cobrar = params.value;

            req.write(JSON.stringify({ sender_batch_header:
                { email_subject: 'Pago realizado',
                  sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
               items:
                [ 
                  { recipient_type: 'PAYPAL_ID',//por idpaypal
                    amount: { value: monto_a_cobrar, currency: 'USD' },
                    receiver: paypal_id,
                    note: 'Pago a usuario por id'}
                ] }));
             req.end();
             
             
             return res.status(200).send({
                status : 'success',
                message: "Pago realizado a: " + paypal_id
              });
        }
        
    
        
      },

};
//Expoertar para las rutas
module.exports = controller;
