const ErrorResponse = require('../utils/errorResponse');
const config = require('../utils/config.json');


const errorHandler = (err, request, response, next) => {
    let error = { ...err };
    console.log(err);
    error.message = err.message;
    if (err.code === 11000) {
        const message = 'Duplicate Field value Enter';
        error = new ErrorResponse(message, 200);
    }

    if (`${err.name}` === "ValidationError") {
        console.log('validation test');
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(message, 200);
    }


    response.status(error.statusCode || 200).json({
        status: config.status_error,
        message: error.message || 'server error'
    });
};

module.exports = errorHandler;