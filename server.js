const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db_config');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Adicionado para criptografia de senha

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta publich

// Rota de Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Dados recebidos:', email, password);

    console.log('Login attempt with email:', email); // Log para depuração

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err); // Log do erro
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (result.length > 0) {
            // Senha armazenada no banco de dados (pode ser criptografada ou não)
            const storedPassword = result[0].password;
            console.log('Usuário encontrado, verificando senha...'); // Log para indicar que o usuário foi encontrado

            // Verifica se a senha está criptografada (assumindo que senhas bcrypt começam com $2b$)
            if (!storedPassword.startsWith('$2b$')) {
                console.log('Senha em texto simples detectada, verificando sem criptografia...');

                // Compara a senha diretamente se estiver em texto simples
                if (storedPassword === password) {
                    console.log('Senha correta, atualizando para criptografia...');

                    // Se a senha for válida, criptografa e atualiza no banco de dados
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error('Erro ao criptografar a senha:', err); // Log do erro
                            return res.status(500).json({ success: false, message: 'Erro ao atualizar a senha.' });
                        }

                        // Atualiza a senha no banco de dados com a nova versão criptografada
                        const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
                        db.query(updateQuery, [hashedPassword, email], (err, result) => {
                            if (err) {
                                console.error('Erro ao salvar a senha criptografada:', err); // Log do erro
                                return res.status(500).json({ success: false, message: 'Erro ao salvar a senha criptografada.' });
                            }

                            console.log('Senha atualizada com sucesso para usuário:', email); // Log de sucesso
                            res.json({ success: true, message: 'Login realizado com sucesso!' });
                        });
                    });
                } else {
                    console.log('Senha incorreta.'); // Log de senha incorreta
                    res.json({ success: false, message: 'Senha incorreta.' });
                }
            } else {
                // Se a senha já estiver criptografada, compara usando bcrypt
                bcrypt.compare(password, storedPassword, (err, isMatch) => {
                    if (err) {
                        console.error('Erro ao comparar as senhas:', err); // Log de erro
                        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
                    }

                    if (isMatch) {
                        console.log('Senha correta, login realizado com sucesso!'); // Log de sucesso
                        res.json({ success: true, message: 'Login realizado com sucesso!' });
                    } else {
                        console.log('Senha incorreta.'); // Log de senha incorreta
                        res.json({ success: false, message: 'Senha incorreta.' });
                    }
                });
            }
        } else {
            console.log('Usuário não encontrado.'); // Log quando o usuário não é encontrado
            res.json({ success: false, message: 'Usuário não encontrado. Redirecionando para o registro.' });
        }
    });
});

// Rota de Registro
// Rota de Registro (dados básicos)
app.post('/register', (req, res) => {
    console.log('Requisição de registro recebida:', req.body);

    const { nome, email, cpf, password } = req.body;

    // Verifica se todos os campos básicos foram preenchidos
    if (!nome || !email || !cpf || !password) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    console.log('Tentativa de registro com email:', email);

    // Verifica se o email ou CPF já estão registrados
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR cpf = ?';
    db.query(checkUserQuery, [email, cpf], (err, result) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (result.length > 0) {
            console.log('Email ou CPF já registrado:', { email, cpf });
            res.json({ success: false, message: 'Este email ou CPF já está registrado.' });
        } else {
            // Criptografa a senha antes de salvar no banco
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Erro ao criptografar a senha:', err);
                    return res.status(500).json({ success: false, message: 'Erro no servidor.' });
                }

                // Insere apenas os dados básicos
                const query = 'INSERT INTO users (nome, email, password, cpf) VALUES (?, ?, ?, ?)';
                const values = [nome, email, hashedPassword, cpf];

                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error('Erro ao registrar usuário:', err);
                        return res.status(500).json({ success: false, message: 'Erro ao registrar.' });
                    }

                    console.log('Usuário registrado com sucesso:', email);
                    res.json({ success: true, message: 'Usuário registrado com sucesso!' });
                });
            });
        }
    });
});

// Rota para atualizar informações de um usuário
app.put('/update-user', (req, res) => {
    const { cpf, data_nascimento, rua, numero, cep, bairro, cidade } = req.body;

    // Verifica se o CPF foi enviado
    if (!cpf) {
        return res.status(400).json({ success: false, message: 'O CPF é obrigatório para a atualização.' });
    }

    console.log('Tentativa de atualização para o CPF:', cpf);

    // a query dinâmica para incluir apenas os campos enviados
    let query = 'UPDATE users SET ';
    const values = [];

    if (data_nascimento) {
        query += 'data_nascimento = ?, ';
        values.push(data_nascimento);
    }
    if (rua) {
        query += 'rua = ?, ';
        values.push(rua);
    }
    if (numero) {
        query += 'numero = ?, ';
        values.push(numero);
    }
    if (cep) {
        query += 'cep = ?, ';
        values.push(cep);
    }
    if (bairro) {
        query += 'bairro = ?, ';
        values.push(bairro);
    }
    if (cidade) {
        query += 'cidade = ?, ';
        values.push(cidade);
    }

    // Remove a vírgula final e adiciona a cláusula WHERE
    query = query.slice(0, -2) + ' WHERE cpf = ?';
    values.push(cpf);

    // Executa a consulta no banco de dados
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao atualizar o usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar os dados.' });
        }

        if (result.affectedRows === 0) {
            console.log('Nenhum usuário encontrado com o CPF informado:', cpf);
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        console.log('Usuário atualizado com sucesso:', cpf);
        res.json({ success: true, message: 'Dados atualizados com sucesso!' });
    });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
