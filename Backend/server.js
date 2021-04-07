const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load config
dotenv.config({path: './config/config.env'});


const app = express();
const fe_app = express();

if( process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
    fe_app.use(morgan('dev'))
}

// Static folder
fe_app.use(express.static(path.join(__dirname, 'public')));

// Apply bodyparser
app.use(express.json());
fe_app.use(express.json());

// Routes
app.use('/', require('./routes/index'));
fe_app.use('/', require('./routes/FE_index'));

const PORT = process.env.PORT || 5000;
const FE_PORT = process.env.FE_PORT || 80;

app.listen(PORT,
     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
     );
     
app.listen(FE_PORT,
    console.log(`Frontend Server running in ${process.env.NODE_ENV} mode on port ${FE_PORT}`)
);