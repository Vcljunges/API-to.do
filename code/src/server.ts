import express from "express";
import { prisma } from './lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "sua_chave_secreta_aqui";

app.use(express.json());

function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
}

app.get('/health', (req, res) => {
    res.json({ status: "OK" });
});

app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: newUser.id });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar usuário. O email já pode estar em uso.' });
    }
});

app.post('/auth', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ message: 'Login realizado com sucesso', token });
});

app.post('/todos', authenticateToken, async (req: any, res: any) => {
    const { task } = req.body;

    const newTodo = await prisma.todoList.create({
        data: {
            task,
            userId: req.user.id
        }
    });

    res.status(201).json(newTodo);
});

app.get('/todos', authenticateToken, async (req: any, res: any) => {
    const userTodos = await prisma.todoList.findMany({
        where: { userId: req.user.id }
    });
    
    res.json(userTodos);
});

app.put('/todos/:id', authenticateToken, async (req: any, res: any) => {
    const todoId = parseInt(req.params.id);
    const { task, finished } = req.body;

    try {
        const updatedTodo = await prisma.todoList.update({
            where: { id: todoId, userId: req.user.id },
            data: { task, finished }
        });
        res.json(updatedTodo);
    } catch (error) {
        res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a você.' });
    }
});

app.delete('/todos/:id', authenticateToken, async (req: any, res: any) => {
    const todoId = parseInt(req.params.id);

    try {
        await prisma.todoList.delete({
            where: { id: todoId, userId: req.user.id }
        });
        res.json({ message: 'Tarefa deletada com sucesso.' });
    } catch (error) {
        res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a você.' });
    }
});

app.listen(PORT, () => {
    console.log(`API a rodar em http://localhost:${PORT}`);
});