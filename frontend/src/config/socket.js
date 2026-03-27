import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    socketInstance = socket.io(import.meta.env.VITE_API_URL, {
        auth: { token },
        query: { projectId },
    });
    return socketInstance;
}

export const recieveMessage = (eventName, callback) => {
    socketInstance.on(eventName, callback);
}
export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}