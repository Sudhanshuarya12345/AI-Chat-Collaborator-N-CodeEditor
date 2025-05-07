import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: function() {
                return this.sender?.type === 'user';
            }
        },
        email: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['user', 'ai'],
            default: 'user'
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel; 