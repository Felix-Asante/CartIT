const mysql = require('mysql')

const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:process.env.DB_LOCK,
    database:'CartIt'
})

conn.connect((err,row)=>{
    if(err) throw err;
    console.log('connected to DB')
})

module.exports = conn;
