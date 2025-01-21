import express from 'express'
import cors from 'cors'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const app = express();
const PORT = 3000;
app.use(express.json())
app.use(cors())

app.get('/patients', async (req, res) => {
    const { cpf, email } = req.query;
  
    // Verifica se há CPF ou e-mail para filtrar
    if (cpf) {
      const patient = await prisma.user.findMany({
        where: { CPF: parseInt(cpf) },
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
  });
  

app.post('/patients', async (req, res) => {
    
   const patients = await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            CPF: req.body.CPF,
            phone: req.body.phone,
            local: req.body.local
          
        },
      })

      console.log(patients)

    res.status(201).json({mensage: 'Paciente cadastrado com sucesso!'} )
})


app.put('/patients/:id', async (req, res) => {

    
    const patients = await prisma.user.update({
        where:{
            id: req.params.id
        },
         data: {
             email: req.body.email,
             name: req.body.name,
             CPF: req.body.CPF,
             phone: req.body.phone,
             local: req.body.local
           
         },
       })
 
        
     res.status(201).json(patients)
 })

 app.delete('/patients/:id', async(req, res) => {
    await prisma.user.delete({
        where: {
            id: req.params.id
        },
        
    })
    res.status(200).json({message: "Paciente deletado com sucesso!"})

 })


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
