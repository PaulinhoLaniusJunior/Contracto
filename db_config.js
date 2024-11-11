const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 

    // Altere para sua senha do MySQL quando for logar
    password: '70502604',
    
    // Altere para seu banco de dados, o meu é contracto data
    database: 'Contractodata'  
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados.');
    }
});

module.exports = db;
