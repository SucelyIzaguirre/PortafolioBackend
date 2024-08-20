const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL
mongoose.connect(MONGO_URL, {
    
})
.then(() => console.log('Base de datos conectada'))
.catch(err => console.log('Error conectando a la base de datos:', err));

