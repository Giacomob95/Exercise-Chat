import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

function Chat({ onLogout }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "dark"
    );



    const handleLogout = function () {
        // chiudo socket e rimuovo token
        if (socket) {
            socket.disconnect();
        }

        localStorage.removeItem("token");
        onLogout();
    };

    const handleChange = (event) => {
        setNewMessage(event.target.value);
    };

    useEffect(() => {
        // funzione async definita dentro l'effetto
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`${API_URL}/messages`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessages(response.data);
            } catch (err) {
                console.error('Errore nel caricamento dei messaggi:', err);
            }
        };

        // inizializzo il socket (senza if: l'effetto gira una volta sola)
        const newSocket = io(API_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        // token rifiutato dal server o server spento
        newSocket.on('connect_error', (error) => {
            console.error('Errore di connessione:', error.message);
        });

        // validazione, autorizzazione, errori di salvataggio/cancellazione
        newSocket.on('message:error', (error) => {
            console.error('Errore messaggio:', error.message);
        });

        newSocket.on('message', (message) => {
            // utilizzo la funzione prev per mantenere i messaggi già caricati
            setMessages(prev => [...prev, message]);
        });

        // gestisce il render dei messaggi dopo una cancellazione
        newSocket.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
        });

        // lo salvo nello stato per usarlo in handleSubmit, handleDelete e handleLogout
        setSocket(newSocket);
        fetchMessages();

        // cleanup: chiude questo socket quando il componente si smonta
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);   // usa il nome del tuo stato dei messaggi

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // una stringa vuota è falsy, quindi !"" è true: con messaggio vuoto esco subito
        if (!newMessage.trim() || !socket) return;

        socket.emit("message", { content: newMessage });
        setNewMessage("");   // svuota l'input
    };

    const handleDelete = (messageId) => {
        if (!socket) return;
        socket.emit("deleteMessage", { messageId });
    };

    return (
        <div className="chatContainer">
            <div className="chatHeader">
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>

                
                    <button onClick={toggleTheme} className="theme-button">
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                    
             
            </div>



            <div className="messagesContainer">
                {messages.map((message) => (
                    <div key={message.id} className="message">
                        <strong>{message.username}: </strong>
                        <span className="content">{message.content}</span>
                        <button
                            className="delete-button"
                            onClick={() => handleDelete(message.id)}
                        >
                            X
                        </button>
                    </div>
                ))}
                <div ref={messagesEndRef} style={{ height: "80px" }} />
            </div>

            <form onSubmit={handleSubmit} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleChange}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;