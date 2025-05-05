import { getChatsFromAUser, getMessagesBetweenUsers, saveMessage } from '../database/database.js';

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('authenticate', async (userId) => {
            try {
                socket.userId = userId;
                
                socket.join(`user_${userId}`);
                
                const chats = await getChatsFromAUser(userId);
                socket.emit('chats', chats);
                
                console.log(`User ${userId} authenticated and received chats`);
            } catch (error) {
                console.error('Authentication error:', error);
                socket.emit('error', { message: 'Failed to authenticate user' });
            }
        });
        
        socket.on('get_messages', async (destinationId) => {
            try {
                if (!socket.userId) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }
                
                const messages = await getMessagesBetweenUsers(socket.userId, destinationId);
                socket.emit('messages', { destinationId, messages });
                
                console.log(`Sent messages between ${socket.userId} and ${destinationId}`);
            } catch (error) {
                console.error('Error getting messages:', error);
                socket.emit('error', { message: 'Failed to get messages' });
            }
        });
        
        socket.on('send_message', async ({ message, destinationId }) => {
            try {
                if (!socket.userId) {
                    socket.emit('error', { message: 'User not authenticated' });
                    return;
                }
                
                await saveMessage(socket.userId, message, destinationId);
                
                const messages = await getMessagesBetweenUsers(socket.userId, destinationId);
                
                socket.emit('messages', { destinationId, messages });
                
                io.to(`user_${destinationId}`).emit('new_message', {
                    fromUserId: socket.userId,
                    message,
                    messages
                });
                
                console.log(`Message sent from ${socket.userId} to ${destinationId}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (socket.userId) {
                socket.leave(`user_${socket.userId}`);
            }
        });
    });
}
