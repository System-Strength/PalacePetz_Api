const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')

const userRoute = require('./routes/users')
const productRoute = require('./routes/products')
const categoryRoute = require('./routes/category')
const mobileRoute = require('./routes/mobile')
const testRoute = require('./tests/routes/tests')

//  Configuring APP
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false})); // ONLY simple data
app.use(bodyParser.json()); // body entry json

//  Configuring request
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

//  Default Routes
app.get('/', async (request, response) => {
    //  Base Url
    response.redirect('http://palacepetz.azurewebsites.net')
});

app.get('/emailconfirmed', async (request, response) => {
    response.redirect('https://www.kauavitorio.com/palacepetz/email/verifiedemail')
});

//  User Route
app.use('/user', userRoute);

// Products Route
app.use('/products', productRoute);

// Category Route
app.use('/category', categoryRoute);

// Category Route
app.use('/mobile', mobileRoute);

//  Router for Test
app.use('/test', testRoute); 

//  When rote not found, joing here:
app.use((req, res, next) => {
    const erro = new Error('Not found');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
}); //  End "HERE"

module.exports = app;