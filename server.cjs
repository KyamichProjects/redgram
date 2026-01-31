
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

// In-memory store
let users = [];
let messages = {}; // chatId -> messages[]

console.log('🔴 RedGram Server started on port 8080');
console.log('You can now connect from different browsers or devices in your local network.');

function broadcast(data, excludeWs = null) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client !== excludeWs) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    // 1. Send current state to the new client
    ws.send(JSON.stringify({ 
        type: 'INIT_STATE', 
        users: users 
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'REGISTER':
                    // Check if user exists
                    const existingUserIndex = users.findIndex(u => u.username === data.profile.username);
                    if (existingUserIndex >= 0) {
                        users[existingUserIndex] = data.profile; // Update info
                    } else {
                        users.push(data.profile);
                    }
                    console.log(`User registered: ${data.profile.username}`);
                    
                    // Broadcast new user to everyone else
                    broadcast({ 
                        type: 'USER_JOINED', 
                        profile: data.profile 
                    }, ws);
                    break;

                case 'SEND_MESSAGE':
                    console.log(`Message from ${data.message.senderId} to ${data.message.chatId}`);
                    // Broadcast to everyone (client handles filtering)
                    broadcast({
                        type: 'NEW_MESSAGE',
                        message: {
                            ...data.message,
                            sender: 'them', // Ensure receiver sees it as 'them'
                            status: 'sent'
                        }
                    }, ws);
                    break;
                
                case 'READ_RECEIPT':
                    // Broadcast that messages were read
                    console.log(`Messages read in chat ${data.chatId} by ${data.readerId}`);
                    broadcast({
                        type: 'MESSAGE_READ',
                        chatId: data.chatId,
                        messageIds: data.messageIds,
                        readerId: data.readerId
                    }, ws);
                    break;

                case 'PRESENCE':
                    // Simple echo for now, could update user status
                    break;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
