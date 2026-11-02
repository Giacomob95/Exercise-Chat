import { useState } from "react";
import axios from "axios";
//aggiungo link per poter inserire un link di rimando a register
//nel caso di login che non funziona 
import { Link } from "react-router-dom";
import { API_URL } from '../config';

function Login({ onLogin }) {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            return { ...prev, [name]: value };
        });

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username: formData.username,
                password: formData.password
            });

            localStorage.setItem('token', response.data.token);
            //come in register chiamo la func che setta
            // autenticazione a true
            onLogin();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };


    return (
        <div className="container">
            <div className="login-form">
                <h2>Login to Chat</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            onChange={handleChange}
                            required
                            value={formData.username}
                        // add the onChange action handler
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
                        // add the onChange action handler
                        />
                    </div>
                    <button type="submit">Login</button>

                    <p>Non hai un account? <Link to="/register">Registrati</Link></p>
                </form>
            </div>
        </div>
    );
};


export default Login;
