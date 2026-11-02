import { useState } from "react";
import axios from "axios";
import { API_URL } from '../config';

function Register({ onLogin }) {
    // ─── STATO ───────────────────────────────────────
    const [error, setError] = useState('');
    // oggetto con tre coppie chiave/valore, una per ogni campo del form
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    // ─── FUNZIONI ────────────────────────────────────
    // salva nello stato ciò che l'utente digita in un campo del form
    const handleChange = (event) => {
        // apro l'oggetto event.target (l'input modificato) ed estraggo
        // le due proprietà in due variabili con lo stesso nome
        const { name, value } = event.target;

        setFormData(prev => {
            // lo spread copia tutte le coppie chiave/valore di prev,
            // poi [name]: value sovrascrive solo il campo corrispondente
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // previene il comportamento HTML classico (ricaricamento)
        setError('');           // cancella l'errore del tentativo precedente

        // controllo i dati salvati da handleChange
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // invio username e password al backend e aspetto la risposta,
            // che contiene il token generato dal server
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: formData.username,
                password: formData.password
            });
            // salvo il token ricevuto nella risposta
            localStorage.setItem('token', response.data.token);
            // chiamo la prop da App per impostare l'autenticazione a true
            onLogin();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    // ─── JSX ─────────────────────────────────────────
    return (
        <div className="container">
            <div className="login-form">
                <h2>Register for Chat</h2>

                {/* messaggio d'errore, visibile solo se error non è vuoto */}
                {error !== '' ? <div className="error">{error}</div> : null}

                {/* onSubmit è un attributo del tag form: esegue handleSubmit all'invio */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            onChange={handleChange}
                            // required rende il campo obbligatorio
                            required
                            value={formData.username}
                            minLength="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            onChange={handleChange}
                            required
                            value={formData.password}
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            onChange={handleChange}
                            required
                            value={formData.confirmPassword}
                        />
                    </div>

                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}   // ← la funzione Register si chiude QUI, dopo il return

export default Register;

