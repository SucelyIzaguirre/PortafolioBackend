require('dotenv').config();
const app = require('./config/server');


app.listen(app.get('PORT'), () => {
    console.log('app en el puerto', app.get('PORT'));
});