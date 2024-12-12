const express = require('express');
const bodyParser = require('body-parser');
const {db} = require('./db_config');
const { execute }  = require('./db_config')
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importa JWT
const fs = require('fs');
const path = require('path');
const multer = require('multer')

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// const uploadDir = path.join(__dirname, 'uploads');

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage });

const SECRET_KEY = 'secreto'; // Use uma chave forte e segura para produção


// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token ausente.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido em negão' });
        console.log('token descodificado', user)
        req.user = user;
        next();
    });
};


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
        if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const storedPassword = result[0].password;
        const userId = result[0].id;

        bcrypt.compare(password, storedPassword, (err, isMatch) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Senha incorreta.' });
            }

            const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '1h' });
            console.log('token gerado', token)
            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                token
            });
        });
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

app.post('/profile', async (req, res) => {
    const {
        nome,
        email,
        celular,
        dataNascimento,
        cpf,
        rua,
        bairro,
        numero,
        cidade,
        cep,
        tipoConta
    } = req.body;

    try {
        // Verificação básica dos campos obrigatórios
        if (!nome || !email || !cpf || !tipoConta) {
            return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
        }

        // Query para atualizar os dados no banco
        const query = `
            UPDATE users 
            SET 
                nome = ?, 
                email = ?, 
                celular = ?, 
                data_nascimento = ?, 
                rua = ?, 
                bairro = ?, 
                numero = ?, 
                cidade = ?, 
                cep = ? 
            WHERE cpf = ?
        `;

        // Executar a query de atualização
        await execute(query, [
            nome,
            email,
            celular,
            dataNascimento,
            rua,
            bairro,
            numero,
            cidade,
            cep,
            cpf // CPF será usado como critério para localizar o registro
        ]);

        return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar os dados no banco:', error);
        return res.status(500).json({ success: false, message: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});

app.post('/upload',authenticateToken, upload.single('file'), (req, res) => {
    const file = req.file;
    
    if (!file) {
        console.log('if do arquivo')
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
    
    const { originalname } = file;
    const caminho = `/uploads/${file.filename}`; // Supondo que o arquivo seja salvo na pasta "uploads"
    //const usuario_id = req.user.id; // Substitua pelo ID do usuário autenticado, se houver autenticação
    
    const usuario_id = req.user ? req.user.id : null;
    if (!usuario_id) {
    console.log('if do usuario token')
    return res.status(401).json({ message: 'Usuário não autenticado.' });
} 

    // Insere os dados no banco de dados
    const query = `
        INSERT INTO contratosfile (nome, caminho, usuario_id) 
        VALUES (?, ?, ?)
    `;
    db.query(query, [originalname, caminho, usuario_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
        }

        res.status(200).json({ message: 'Arquivo salvo com sucesso!', fileId: result.insertId });
    });
});

app.get('/view/:id', (req, res) => {
    const fileId = req.params.id;

    // Busca o caminho do arquivo no banco de dados
    const query = 'SELECT caminho FROM contratosfile WHERE id = ?';
    db.query(query, [fileId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar o arquivo no banco de dados.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Arquivo não encontrado.' });
        }

        const filePath = path.join(__dirname, results[0].caminho);

        // Verifica se o arquivo existe no sistema de arquivos
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Arquivo não encontrado no servidor.' });
        }

        // Envia o arquivo como resposta
        res.sendFile(filePath);
    });
});

app.get('/contracts', authenticateToken, (req, res) => {
    
    const usuario_id = req.user.id; // Substitua pelo ID do usuário autenticado

    const query = `
        SELECT nome, caminho FROM contratosfile 
        WHERE usuario_id = ?
    `;
    db.query(query, [usuario_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao recuperar contratos.' });
        }

        res.status(200).json({ contracts: results });
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});