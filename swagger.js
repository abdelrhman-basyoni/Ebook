const swaggerAutogen = require('swagger-autogen')()


const doc = {
    info: {
        version: "1.0.0",
        title: "My API",
        description: "swagger created"
    },
    host: "localhost:5000",
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "User",
            "description": "Endpoints"
        }
    ],
    securityDefinitions: {
        apiKeyAuth:{
            type: "apiKey",
            in: "header",       // can be "header", "query" or "cookie"
            name: "Authorization",  // name of the header, query parameter or cookie
            description: "authorization header"
        }
    },
   
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/account.js','./routes/book.js','./routes/index.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./server')           // Your project's root file
})