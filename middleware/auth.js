require('dotenv').config({ path: './config/config.env' })
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
module.exports = {
    ensureAuth: async function (request, response, next) {
        if(!request.headers['authorization']) {
            return next(new ErrorResponse('missing auth credentials', 401));
        }
        const tokenheader = request.headers['authorization']
        const token = tokenheader.split(' ')[1]
        if (token == null) {
            return next(new ErrorResponse('missing auth credentials', 401));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
            if (error) {
                return next(new ErrorResponse('invalid auth credentials', 403));

            }
            request.user = user
            next()
        });

    },
    ensurePublisher: async function (request, response, next) {
        if(!request.headers['authorization']) {
            return next(new ErrorResponse('missing auth credentials', 401));
        }
        const tokenheader = request.headers['authorization']
        const token = tokenheader.split(' ')[1]
        if (token == null) {
            return next(new ErrorResponse('missing auth credentials', 401));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
            if (error) {
                return next(new ErrorResponse('invalid auth credentials', 403));

            }
            if (user.isPublisher !== true){
                return next(new ErrorResponse('you are not a publisher', 403));
            }
            request.user = user;
            next()
        });

    },
    requiredFields: function ( fields) {
        //check if an array of fields is existing in the request or not
        return  function (request, response, next){
            for(let index = 0; index < fields.length ; index++ ){
                let element = fields[index]
                if (!request.body[`${element}`] ) {
                     
                     return next(new ErrorResponse( `missing field ${element}`,200)); 
                     
                } 
        
            }
            // return next();
            next()
        }
     
           
            
         
        
    }
    



}