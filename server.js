const https = require("https");
const fs = require('fs');
var mysql=require("mysql");

const hostname = "seminarfach.blockmento.de";
const port = 8080;
const options = {
    cert: fs.readFileSync("/etc/letsencrypt/live/seminarfach.blockmento.de/cert.pem"),
    key: fs.readFileSync("/etc/letsencrypt/live/seminarfach.blockmento.de/privkey.pem")
};

var sql = mysql.createConnection({
    host     : 'localhost',
    user     : 'api',
    password : 'ajkBVb12cBhD66H0Hfwh',
    database : 'test'
  });
sql.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});


// Create HTTP server
const server = https.createServer(options, (req, res) => {
    handleRequest(req, res);
});

// Prints a log once the server starts listening
server.listen(port, hostname, () => {
   console.log(`Server running at https://${hostname}:${port}/`);
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
        
        sql.query(`INSERT INTO \`user\` (\`user_id\`) VALUES ('${user_id}');`);
        return;
    }

    if (req.url == "/upload") { 
        let body = []; //http transaction (edited)
        req.on('error', (err) => {
            console.error(err);
            res.end("false");
          }).on('data', (chunk) => {
            body += chunk;
          }).on('end', () => {
            data=JSON.parse(body);
            console.log(body);
            sql.query(`SELECT \`ID\` AS solution FROM \`user\` WHERE MATCH (\`user_id\`) AGAINST ('${body[5][1]}');`, function (err, results) { //fragt die UID an
                if (err) throw err;
                UID = results[0].solution;
                console.log(body);
                sql.query(
                    `INSERT INTO \`${data.db}\` (\`time\`, \`${(data) => {if (data.db == "network") return "type"; if (data.db == "akku") return "level"}}\`, \`state\`, \`user\`) 
                    VALUES ('${data.time}', '${data.type}', ${data.state}, '${UID}'); `); //speichert die Daten
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
                    sql.query(`INSERT INTO \`network\` (\`time\`, \`type\`, \`state\`, \`user\`) VALUES ('${element.time}', '${element.type}', ${element.state}, '${UID}'); `);
                }
                for (let i = 0; i < Akku.length; i++) { //speichert in die akku Tabelle
                    const element = Akku[i];
                    sql.query(`INSERT INTO \`akku\` (\`time\`, \`level\`, \`state\`, \`user\`) VALUES ('${element.time}', '${element.level}', ${element.state}, '${UID}'); `);
                }
            });
            res.end("true");
          });
        return;
    }
}

//https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/  (http transaction, 26.3.21)
//https://stackoverflow.com/questions/8594097/javascript-split-string-into-2d-array (string to 2d array, 26.3.21)