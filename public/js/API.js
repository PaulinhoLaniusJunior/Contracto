const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 3000;

// Endpoint para analisar o PDF
app.post('/analyze-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    try {
        // Extrair o texto do PDF
        const data = await pdfParse(req.file.buffer);
        const pdfText = data.text;

        // Enviar o texto para a API do Google Gemini para análise
        const geminiResponse = await axios.post(
            'https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/publishers/google/models/gemini-1.5-pro:streamGenerateContent', // Substitua pelo endpoint correto da API Gemini
            {
                prompt: `Analise este contrato: ${pdfText}`,
                // Campos adicionais podem ser necessários dependendo da configuração da API
            },
            {
                headers: {
                    'Authorization': `Bearer AIzaSyDWBKvyRY4XgcaQtt4aVkWW5pXeT7vRrlE`, // Substitua com sua chave de API da Gemini
                    'Content-Type': 'application/json'
                }
            }
        );

        const analysis = geminiResponse.data.responses[0].content; // Ajuste conforme a estrutura da resposta

        res.json({ analysis });
    } catch (error) {
        console.error('Erro ao analisar o PDF:', error);
        res.status(500).json({ error: 'Erro ao processar o arquivo.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
