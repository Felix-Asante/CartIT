const mysql = require("mysql");

const conn = mysql.createConnection({
	host: process.env.DB_HOST,
	user: "admin",
	port: process.env.DB_PORT,
	password: process.env.DB_LOCK,
	database: "CartIt",
});

conn.connect((err, row) => {
	if (err) throw err;
	console.log("connected to DB");
});

module.exports = conn;
