var mysql = require('mysql');

//Create connection to DB
var connection = mysql.createConnection({
    host: "mwgmw3rs78pvwk4e.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "x5xhg901hjefvq0u",
    password: "ixcckomsi3ojkt7a",
    database: "iv28dtvanxwxdm51"
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

module.exports = connection;