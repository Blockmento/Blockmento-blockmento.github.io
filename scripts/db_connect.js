const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'v2202102140391141863.powersrv.de',
    user: 'test',
    password: 'testpass',
    database: 'test',
    insecureAuth : true
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});