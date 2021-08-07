require('dotenv').config({ path: './config/config.env' })
const errorHandler = require('./middleware/error');
const express = require('express');
const middlewares = require('./config/serverconfig');
const app = express();
const socketIO = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketIO(server, {
  path: '/notification/'
})
const PORT = process.env.PORT || 5000;

// const swaggerJsDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express')
// const swaggerOptions = {
//     swaggerDefinition: {
//         info: {
//             version: "1.0.0",
//             title: "Customer API",
//             description: "Customer API Information",
//             contact: {
//                 name: "Amazing Developer"
//             },
//             servers: ["http://localhost:5000"]
//         }
//     },
//     // 
//     apis: [".routes/*.js"]
// };

// const swaggerAutogen = require('swagger-autogen')();

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')



// database
const connectDB = require('./config/db')
connectDB()


// app.use(express.json());

//extra middle wares to handle requests
middlewares(app);



//socket
require('./controllers/notification')(io)


// define apps
app.use('/', require('./routes/index'));
//register system
app.use('/account', require('./routes/account'));
// book APIS
app.use('/book', require('./routes/book'));

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


// custom error handler middleware (make it last thing to add)
app.use(errorHandler);




module.exports = server.listen(PORT, () => console.log(`server is running  in ${process.env.NODE_ENV} on port ${PORT}`))