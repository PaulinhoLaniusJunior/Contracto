const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db_config');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Adicionado para criptografia de senha

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta public

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
app.post('/register', (req, res) => {
    console.log('requisição de registro recebida', req.body);
    const { email, password } = req.body;

    console.log('Tentativa de registro com email:', email); // Log para depuração

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, result) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err); // Log do erro
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (result.length > 0) {
            console.log('Email já registrado:', email); // Log de email já registrado
            res.json({ success: false, message: 'Este email já está registrado.' });
        } else {
            // Criptografa a senha antes de armazená-la
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Erro ao criptografar a senha:', err); // Log do erro
                    return res.status(500).json({ success: false, message: 'Erro no servidor.' });
                }

                const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
                db.query(query, [email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Erro ao registrar usuário:', err); // Log do erro
                        return res.status(500).json({ success: false, message: 'Erro ao registrar.' });
                    }

                    console.log('Usuário registrado com sucesso:', email); // Log de sucesso
                    res.json({ success: true, message: 'Registrado com sucesso!' });
                });
            });
        }
    });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
