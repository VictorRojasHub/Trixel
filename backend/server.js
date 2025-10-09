// server.js

// 1. Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// 2. Conectar ao MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
        
        // 3. Iniciar o servidor Express APENAS após a conexão
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Erro de conexão com o MongoDB:', error.message);
        process.exit(1); // Encerra o processo se a conexão falhar
    });

// Adicione middlewares essenciais (será feito na tarefa 0.4)
app.use(express.json());