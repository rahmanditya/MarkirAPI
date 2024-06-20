require('dotenv').config();

module.exports = {
          /* Local Database 
    multipleStatements: true,
    host: '',
    user: '',
    password: '',
    database: '',*/

      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}` 
};