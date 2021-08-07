const config = require('../utils/config.json')
const express = require('express');
const formparser = require('express-formidable');
const customParser = () => {
  //this parser to make all the fields in both express.json and formidable
  //in the same request .body
  return function (request, response, next)  {
    if (request.fields) {
      request.body = request.fields
      delete request.fields;
     return next()
    }
    return next()
  }

}

process.env.STATUS_SUCCESS = config.status_success;
process.env.STATUS_ERROR = config.status_error;

function configure_myapp(app) {
  // middle wares to read request data
  // app.use(upload.array());
  
  
  app.use(formparser());
  // app.use(express.json());
  app.use(customParser());





};

module.exports = configure_myapp