import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        query: { projectId },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socketInstance;
}

export const recieveMessage = (eventName, callback) => {
    if (!socketInstance) {
        console.warn('Socket not initialized when trying to listen for:', eventName);
        return;
    }
    console.log('Setting up listener for:', eventName);
    socketInstance.on(eventName, callback);
}

export const removeMessageListener = (eventName, callback) => {
    if (!socketInstance) return;
    console.log('Removing listener for:', eventName);
    socketInstance.off(eventName, callback);
}

export const sendMessage = (eventName, data) => {
    if (!socketInstance) {
        console.warn('Socket not initialized when trying to send:', eventName);
        return;
    }
    console.log('Sending message:', eventName, data);
    socketInstance.emit(eventName, data);
}