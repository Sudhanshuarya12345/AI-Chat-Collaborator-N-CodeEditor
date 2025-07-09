import express from 'express'
import morgan from 'morgan'
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import projectRoutes from './routes/project.routes.js'
import aiRoutes from './routes/ai.routes.js'


connect();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://ai-chat-collaborator-n-code-editor.vercel.app',
  credentials: true,
})) // middleware for enabling CORS

app.use(morgan('dev'))

app.use(express.json());

app.use(express.urlencoded({ extended:true }))

app.use('/users', userRoutes)

app.use('/projects', projectRoutes)

app.use('/ai', aiRoutes)

app.use(cookieParser()) // middleware for parsing cookies

  
app.get('/', (req, res)=> {
    res.send('Hello world')
})


export default app 