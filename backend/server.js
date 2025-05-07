import http from 'http'
import app from './app.js'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import projectModal from './models/project.model.js'
import chatModel from './models/chat.model.js'
import { generateResult } from './services/ai.service.js'
dotenv.config()


const port = process.env.PORT || 3000;

const server = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: '*',
        // methods: ['GET', 'POST'],
        // credentials: true,
    },
})

io.use( async(socket, next) => {
    try{
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return next(new Error('Project ID is invalid or missing'));
        }

        socket.project = await projectModal.findById(projectId);

        if(!token){
            return next(new Error('Authentication error'));
        }   

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
            return next(new Error('Authentication error'));
        }

        socket.userId = decoded;
        next();
    }
    catch(err){
        return next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    socket.roomId = socket.project._id.toString();

    console.log('a user connected');

    socket.join(socket.roomId);

    // Send chat history when user connects
    chatModel.find({ projectId: socket.project._id })
        .sort({ timestamp: 1 })
        .then(messages => {
            socket.emit('chat-history', messages);
        })
        .catch(err => {
            console.error('Error fetching chat history:', err);
        });

    socket.on('project-message', async (data) => {
        const aiIsPresentInMessage = data.message.toLowerCase().includes('@ai');
        
        try {
            // Save the user message to database
            const chatMessage = new chatModel({
                projectId: socket.project._id,
                message: data.message,
                sender: {
                    _id: data.sender._id,
                    email: data.sender.email,
                    type: 'user'
                }
            });
            await chatMessage.save();
            
            socket.broadcast.to(socket.roomId).emit('project-message', data);
            
            if(aiIsPresentInMessage){
                const prompt = data.message.replace('@ai', '');
                const result = await generateResult(prompt);
                
                // Save AI response to database without _id
                const aiMessage = new chatModel({
                    projectId: socket.project._id,
                    message: result,
                    sender: {
                        email: 'AI',
                        type: 'ai'
                    }
                });
                await aiMessage.save();

                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        email: 'AI',
                        type: 'ai'
                    }
                });
            }
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId);
    });
});

server.listen(3000, ()=>{
    console.log(`Server is running on port ${port}.`)
})

 