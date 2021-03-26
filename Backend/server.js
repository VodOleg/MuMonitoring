const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load config
dotenv.config({path: './config/config.env'});


const app = express();

if( process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Apply bodyparser
app.use(express.json());


// Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,
     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
     );