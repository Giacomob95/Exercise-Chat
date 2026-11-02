const { messageService } = require('../data/dataService.js'); // adatta il percorso se dataService.js è in un'altra cartella
const { checkAuthSocket } = require('../routes/auth.js'); // importato, non riscritto qui

// registra gli eventi: viene chiamata una sola volta all'avvio del server
const initializeSocketIO = (io) => {
    io.use(checkAuthSocket); // ogni connessione deve passare da qui prima di arrivare a 'connection'

    // si attiva a ogni nuova connessione (già autenticata, a questo punto)
    io.on('connection', (socket) => {
        console.log('User connected:', socket.username);

        socket.on('message', async (data) => {
            try {
                if (!data || !data.content) {
                    socket.emit('message:error', { message: 'Content is required' });
                    return;
                }

                // non serve più fidarsi di data.username: lo sai già da socket.username
                //prendo la parte content dei data(i dati che arrivano dal client)
                const message = await messageService.createMessage(data.content, socket.username);
                // lo trasmette a tutti i client
                io.emit('message', message);

            } catch (error) {
                socket.emit('message:error', { message: 'Error sending message' });
            }
        });

        // cancellazione di un messaggio
        socket.on('deleteMessage', async (data) => {
            try {
                if (!data || !data.messageId) {
                    socket.emit('message:error', { message: 'Message id is required' });
                    return;
                }

                // autorizzazione: solo chi ha scritto il messaggio può cancellarlo
                const messages = await messageService.getMessages();
                const message = messages.find(m => m.id === Number(data.messageId));

                if (!message) {
                    socket.emit('message:error', { message: 'Message not found' });
                    return;
                }

                if (message.username !== socket.username) {
                    socket.emit('message:error', { message: 'You can only delete your own messages' });
                    return;
                }

                const deleted = await messageService.deleteMessages(data.messageId);

                if (!deleted) {
                    socket.emit('message:error', { message: 'Message not found' });
                    return;
                }

                // avvisa tutti i client che il messaggio è stato cancellato
                io.emit('messageDeleted', { messageId:  Number(data.messageId) });

            } catch (error) {
                socket.emit('message:error', { message: 'Error deleting message' });
            }
        });

        // disconnessione del client
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.username);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};

module.exports = { initializeSocketIO };