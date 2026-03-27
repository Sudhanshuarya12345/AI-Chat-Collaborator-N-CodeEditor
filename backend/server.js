import http from 'http'
import app from './app.js'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import projectModal from './models/project.model.js'
import chatModel from './models/chat.model.js'
import userModel from './models/user.model.js'
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

        socket.user = decoded;
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
        const rawMessage = data?.message ?? '';
        const trimmedMessage = rawMessage.trim();
        const aiMessageStartsWithTag = /^@ai\b/i.test(trimmedMessage);
        
        try {
            const senderEmail = data?.sender?.email || socket.user?.email;
            let senderId = data?.sender?._id || socket.user?._id;

            if (!senderId && senderEmail) {
                const senderUser = await userModel.findOne({ email: senderEmail }).select('_id email');
                if (senderUser) {
                    senderId = senderUser._id;
                }
            }

            if (!senderId || !senderEmail) {
                throw new Error('Sender identity is missing for this message. Please login again.');
            }

            // Save the user message to database
            const chatMessage = new chatModel({
                projectId: socket.project._id,
                message: rawMessage,
                sender: {
                    _id: senderId,
                    email: senderEmail,
                    type: 'user'
                }
            });
            await chatMessage.save();
            
            socket.broadcast.to(socket.roomId).emit('project-message', {
                ...data,
                message: rawMessage,
                sender: {
                    _id: senderId,
                    email: senderEmail,
                    type: 'user'
                }
            });
            
            if(aiMessageStartsWithTag){
                const prompt = trimmedMessage.replace(/^@ai\b/i, '').trim();

                if (!prompt) {
                    return;
                }

                try {
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
                } catch (aiError) {
                    let aiErrorMessage = 'AI could not respond right now. Please try again in a moment.';

                    if (aiError?.code === 'ALL_AI_PROVIDERS_FAILED' && Array.isArray(aiError?.failures)) {
                        const failureSummary = aiError.failures
                            .map((f) => `${f.provider}: ${String(f.message || 'failed').slice(0, 90)}`)
                            .join(' | ');

                        aiErrorMessage = `All configured AI providers failed. ${failureSummary}`;
                    } else {
                        const isQuotaError = aiError?.status === 429 || /quota|too many requests/i.test(aiError?.message || '');
                        if (isQuotaError) {
                            aiErrorMessage = 'AI quota limit reached for the current API key. Please enable billing or use a key with available quota, then try again.';
                        }
                    }

                    console.error('AI response generation failed:', aiError);

                    io.to(socket.roomId).emit('project-message', {
                        message: JSON.stringify({ text: aiErrorMessage }),
                        sender: {
                            email: 'AI',
                            type: 'ai'
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error processing user message:', err);

            io.to(socket.roomId).emit('project-message', {
                message: JSON.stringify({
                    text: 'Message could not be processed. Please refresh and try again.',
                }),
                sender: {
                    email: 'AI',
                    type: 'ai'
                }
            });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId);
    });
});

server.listen(8080, ()=>{
    console.log(`Server is running on port ${port}.`)
})

 