const express = require('express');
const path = require('path');
const app = express();
const appRoute = require('../routes/routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(__dirname, 'views/assets/css')));
app.use('/js', express.static(path.join(__dirname, 'views/assets/javascripts')));

const PORT = process.env.PORT || 5000;

app.use('/', appRoute);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});