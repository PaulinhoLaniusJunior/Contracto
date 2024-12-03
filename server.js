const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db_config');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importa JWT
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const SECRET_KEY = 'sua-chave-secreta'; // Use uma chave forte e segura para produção


// Middleware para verificar o token JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido.' });
        req.user = user; // Armazena os dados decodificados do token
        next();
    });
}

// Rota para registrar um novo usuário
app.post('/register', (req, res) => {
    const { nome, email, cpf, password } = req.body;
    console.log(`nome: ${nome} email: ${email}, cpf ${cpf}, passowrd: ${password}`)

    if (!nome || !email || !cpf || !password) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR cpf = ?';
    db.query(checkUserQuery, [email, cpf], (err, result) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao verificar usuário.' });
        }

        if (result.length > 0) {
            return res.status(409).json({ success: false, message: 'Email ou CPF já registrados.' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erro ao hash da senha:', err);
                return res.status(500).json({ success: false, message: 'Erro ao processar a senha.' });
            }

            const query = 'INSERT INTO users (nome, email, password, cpf) VALUES (?, ?, ?, ?)';
            db.query(query, [nome, email, hashedPassword, cpf], (err, result) => {
                if (err) {
                    console.error('Erro ao registrar usuário:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao registrar usuário.' });
                }

                res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });
            });
        });
    });
});

// Rota para fazer login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Erro no servidor:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (result.length > 0) {
            const storedPassword = result[0].password;

            bcrypt.compare(password, storedPassword, (err, isMatch) => {
                if (err) {
                    console.error('Erro ao comparar senhas:', err);
                    return res.status(500).json({ success: false, message: 'Erro no servidor.' });
                }

                if (isMatch) {
                    // Gera um token JWT
                    const token = jwt.sign(
                        { email, id: result[0].id },
                        SECRET_KEY,
                        { expiresIn: '1h' }
                    );

                    // Loga o token no terminal do servidor
                    console.log(`Token gerado para o usuário ${email}:`, token);

                    res.json({
                        success: true,
                        message: 'Login realizado com sucesso!',
                        token
                    });
                } else {
                    res.status(401).json({ success: false, message: 'Senha incorreta.' });
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
    });
});

// Rota para buscar os dados do usuário logado
app.get('/user/me', authenticateToken, (req, res) => {
    const userId = req.user.id; // ID do usuário extraído do token

    const query = 'SELECT nome, email, cpf FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar dados.' });

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        res.json({ success: true, user: results[0] }); // Retorna os dados do usuário
    });
});

app.post('/profile', authenticateToken, async (req, res) => {
    const {
        nome,
        sobrenome,
        email,
        celular,
        dataNascimento,
        cpf,
        rua,
        bairro,
        numero,
        cidade,
        cep,
    } = req.body;

    try {
        // Verificação básica dos campos obrigatórios
        if (!nome || !sobrenome || !email || !cpf || !tipoConta) {
            return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
        }

        // Query para inserir os dados no banco
        const query = `
            INSERT INTO usuarios 
            (nome, sobrenome, email, celular, data_nascimento, cpf, rua, bairro, numero, cidade, cep)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [
            nome,
            sobrenome,
            email,
            celular,
            dataNascimento,
            cpf,
            rua,
            bairro,
            numero,
            cidade,
            cep,
        ]);

        return res.status(201).json({ success: true, message: 'Dados inseridos com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar os dados no banco:', error);
        return res.status(500).json({ success: false, message: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

app.post('/api/save-pdf', authenticateToken, async (req, res) => {
    const { fileName, fileData, idUser } = req.body;

    if (!fileName || !fileData || !idUser) {
        return res.status(400).json({ success: false, message: 'Data do arquivo, Nome do arquivo ou  id do usuario não fornecido.' });
    }

    try {

        const buffer = Buffer.from(fileData, 'base64'); // Converte o Base64 para um buffer
        const filePath = `uploads/${idUser}/${fileName}`; // Caminho para salvar o arquivo
        
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, buffer); // Salva o arquivo no servidor

        // Opcional: salvar informações no banco de dados
        const query = 'INSERT INTO contratos (nome, caminho, usuario_id) VALUES (?, ?, ?)';
        db.query(query, [fileName, filePath, req.user.id]);

        res.status(201).json({ success: true, message: 'Contrato salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar o contrato:', error);
        res.status(500).json({ success: false, message: 'Erro no servidor ao salvar o contrato.' });
    }
});

app.get('/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'Acesso concedido à rota protegida!', user: req.user });
});

app.get('/validate-token', authenticateToken, (req, res) => {
    // Se chegou até aqui, o token é válido
    res.json({ success: true, message: 'Token válido.', user: req.user });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
