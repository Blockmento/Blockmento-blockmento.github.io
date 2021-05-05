// Load HTTP module
const https = require("https");
var mysql=require("mysql");

const hostname = "192.168.0.133";
const port = 8000;


var sql = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'test'
  });
sql.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});


// Create HTTP server
const server = https.createServer((req, res) => {
    handleRequest(req, res);
});

// Prints a log once the server starts listening
server.listen(port, hostname, () => {
   console.log(`Server running at http://${hostname}:${port}/`);
})

function handleRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain',"Access-Control-Allow-Origin": "*"});
    if (req.url == "/ping") {
        res.end('ping');
        return;
    }

    if (req.url == "/new") { //neuer Benutzer
        var user_id;
        //setzt neue Zufällige user_id
        user_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        while (user_id == `SELECT * FROM user WHERE user.user_id='${user_id}'`) {
            user_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        res.end(user_id); //sendet user_id an Client
        
        sql.query(`INSERT INTO \`User\` (\`user_id\`) VALUES ('${user_id}');`);
        return;
    }

    if (req.url == "/upload") { 
        let body = []; //http transaction (edited)
        req.on('error', (err) => {
            console.error(err);
            res.end("false");
          }).on('data', (chunk) => {
            body.push(chunk);
          }).on('end', () => {
            body = Buffer.concat(body).toString().split("&").map(function(e) { //string to 2d array
                return e.split("=").map(String);
            });
            console.log(body);
            sql.query(`SELECT \`ID\` AS solution FROM \`user\` WHERE MATCH (\`user_id\`) AGAINST ('${body[5][1]}');`, function (err, results) { //fragt die UID an
                if (err) throw err;
                UID = results[0].solution;
                console.log(body);
                sql.query(`INSERT INTO \`${body[0][1]}\` (\`date\`, \`time\`, \`${body[3][0]}\`, \`state\`, \`user\`) VALUES ('${body[1][1]}', '${body[2][1]}', '${body[3][1]}', ${body[4][1]}, '${UID}'); `); //speichert die Daten
            });
            res.end("true");
          });
        return;
    }

    if (req.url == "/sync") {
        var success; 
        let body = "";
        req.on('error', (err) => { //http transaction (edited)
            console.error(err);
            res.end("false");
          }).on('data', (chunk) => {
            body += chunk;
          }).on('end', () => {
            array=body.split("|") //Teilt den string in drei arrays auf
            Network=JSON.parse(array[0]); //konvertiert die Strings in ein JSON Objekte
            Akku=JSON.parse(array[1])
            console.log((array[2]));
            sql.query(`SELECT \`ID\` AS solution FROM \`user\` WHERE MATCH (\`user_id\`) AGAINST ('${array[2]}');`, function (err, results) { //fragt die UID an
                if (err) throw err;
                if (results.length==0) { //fals die user_id nicht existiert
                    success = false;
                    return;
                }
                UID = results[0].solution;
                console.log(UID);
                for (let i = 0; i < Network.length; i++) { //speichert in die network Tabelle
                    const element = Network[i];
                    sql.query(`INSERT INTO \`network\` (\`date\`, \`time\`, \`type\`, \`state\`, \`user\`) VALUES ('${element.date}', '${element.time}', '${element.type}', ${element.state}, '${UID}'); `);
                }
                for (let i = 0; i < Akku.length; i++) { //speichert in die akku Tabelle
                    const element = Akku[i];
                    sql.query(`INSERT INTO \`akku\` (\`date\`, \`time\`, \`level\`, \`state\`, \`user\`) VALUES ('${element.date}', '${element.time}', '${element.level}', ${element.state}, '${UID}'); `);
                }
            });
            res.end("true");
          });
        return;
    }
}

//https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/  (http transaction, 26.3.21)
//https://stackoverflow.com/questions/8594097/javascript-split-string-into-2d-array (string to 2d array, 26.3.21)