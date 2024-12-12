const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '70502604',
    database: 'contracto'
});

function execute(query, values = []) {
    db.query(query, values, (err, results) => {
        if (err) {
            console.log('Erro ao executar a consulta SQL', err);
            return;
        } else {
            console.log('Resultados', results);
        }

        db.end();
    });
}

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados.');
    }
});

module.exports = { execute, db };
