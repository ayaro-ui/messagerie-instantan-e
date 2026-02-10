const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "messagerie"
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connecté");
});

module.exports = db;
