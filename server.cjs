const { WebSocketServer } = require('ws');

// Render ОБЯЗАТЕЛЬНО передаёт порт через env
const PORT = process.env.PORT || 8080;

// WebSocket сервер
const wss = new WebSocketServer({
    port: PORT,
    host: '0.0.0.0'
});

// In-memory store
let users = [];

console.log(`🔴 RedGram WebSocket server started on port ${PORT}`);

function broadcast(data, excludeWs = null) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client !== excludeWs) {
            client.send(payload);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('🟢 New client connected');

    // Send initial state
    ws.send(JSON.stringify({
        type: 'INIT_STATE',
        users
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'REGISTER': {
                    const index = users.findIndex(
                        (u) => u.username === data.profile.username
                    );

                    if (index >= 0) {
                        users[index] = data.profile;
                    } else {
                        users.push(data.profile);
                    }

                    console.log(`👤 User registered: ${data.profile.username}`);

                    broadcast(
                        { type: 'USER_JOINED', profile: data.profile },
                        ws
                    );
                    break;
                }

                case 'SEND_MESSAGE': {
                    console.log(
                        `💬 Message from ${data.message.senderId} to ${data.message.chatId}`
                    );

                    broadcast(
                        {
                            type: 'NEW_MESSAGE',
                            message: {
                                ...data.message,
                                sender: 'them',
                                status: 'sent'
                            }
                        },
                        ws
                    );
                    break;
                }

                case 'READ_RECEIPT': {
                    broadcast(
                        {
                            type: 'MESSAGE_READ',
                            chatId: data.chatId,
                            messageIds: data.messageIds,
                            readerId: data.readerId
                        },
                        ws
                    );
                    break;
                }
            }
        } catch (err) {
            console.error('❌ Invalid message:', err);
        }
    });

    ws.on('close', () => {
        console.log('🔴 Client disconnected');
    });
});
