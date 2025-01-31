import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

const app = express();
const PORT = 3000;


// Configuração do multer para processamento de arquivos
const storage = multer.memoryStorage(); // Armazenar o arquivo na memória
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

// Rota para enviar arquivo Excel e processar os dados
app.post('/patients/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Por favor, envie um arquivo Excel.' });
    }

    try {
        console.log('Arquivo recebido:', req.file); // Verifique se o arquivo foi realmente recebido

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer); // Carregar o conteúdo do arquivo Excel
        console.log('Arquivo carregado com sucesso');

        const worksheet = workbook.worksheets[0]; // Assumindo que os dados estão na primeira planilha
        const patients = [];

        worksheet.eachRow((row, rowNumber) => {
          console.log(`Processando linha ${rowNumber}: ${row.values}`); // Para verificar os dados da linha
          if (rowNumber > 1) { // Ignorar a primeira linha (cabeçalho)
              const patient = {
                  name: row.getCell(1).text,
                  CPF: row.getCell(2).text, // CPF como string
                  phone: row.getCell(3).text,
                  email: row.getCell(4).text,
                  local: row.getCell(5).text,
              };
              patients.push(patient);
          }
      });

        console.log('Pacientes extraídos:', patients); // Verifique se os dados estão corretos

        const createdPatients = await prisma.user.createMany({
            data: patients,
        });

        res.status(201).json({ message: 'Arquivo processado com sucesso!', createdPatients });
    } catch (error) {
        console.error('Erro ao processar o arquivo Excel:', error); // Verifique qual erro ocorre
        res.status(500).json({ message: 'Erro ao processar o arquivo Excel.' });
    }
    console.log(req.file);
    
});

// Rota para obter todos os pacientes cadastrados
app.get('/patients', async (req, res) => {
    const { cpf, email } = req.query;

    try {
        // Verifica se há CPF ou e-mail para filtrar
        if (cpf) {
            const patient = await prisma.user.findMany({
                where: { CPF: cpf },
            });
            return res.status(200).json(patient);
        } else if (email) {
            const patient = await prisma.user.findMany({
                where: { email },
            });
            return res.status(200).json(patient);
        }

        const patientsLeitura = await prisma.user.findMany();
        res.status(200).json(patientsLeitura);
    } catch (error) {
        console.error("Erro ao obter pacientes:", error);
        res.status(500).json({ message: "Erro interno ao buscar pacientes." });
    }
});

// Rota para criar um paciente
app.post('/patients', async (req, res) => {
    const { email, name, CPF, phone, local } = req.body;

    try {
        const patients = await prisma.user.create({
            data: {
                email,
                name,
                CPF: String(CPF),
                phone: String(phone),
                local,
            },
        });

        console.log(patients);

        res.status(201).json({ message: 'Paciente cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar paciente:', error);
        res.status(500).json({ message: 'Erro ao cadastrar paciente.' });
    }
});

// Rota para atualizar um paciente
app.put('/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, CPF, phone, local } = req.body;

    try {
        const patients = await prisma.user.update({
            where: { id },
            data: {
                email,
                name,
                CPF,
                phone,
                local,
            },
        });

        res.status(200).json(patients);
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error);
        res.status(500).json({ message: 'Erro ao atualizar paciente.' });
    }
});

// Rota para deletar um paciente
app.delete('/patients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Paciente deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        res.status(500).json({ message: 'Erro ao deletar paciente.' });
    }
});



// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
