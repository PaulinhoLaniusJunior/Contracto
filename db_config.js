const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',    // Altere se necessário
    user: 'root',   // Altere para seu usuário do MySQL
    password: '123456', // Altere para sua senha do MySQL
    database: 'Contracto'  // Altere para seu banco de dados
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados.');
    }
});

module.exports = db;
