document.addEventListener('DOMContentLoaded', () => {
    const incomeForm = document.getElementById('search-bar');

    let balance = 0;

    var mysql = require('mysql');

    var server_conection = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
    });

    server_conection.connect(function(err) {
    if (err) throw err;
    server_conection.query("SELECT * FROM customers", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
    });
});