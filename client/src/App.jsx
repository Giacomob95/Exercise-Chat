import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';
//questa libreria mi permette di applicare le route alla pagina singola html
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';


import "./App.css";

function App() {
    const state = useState(false);
    //stato attuale
    const isAuthenticated = state[0];
    //funzione per cambiarlo
    const setIsAuthenticated = state[1];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []); //parentesi quadre array delle dipendenze
    //qui vuoto perchè lo useeffect deve partire ad ogni CARICAMENTO della pagina(non render)


    return(
        <div className="app">
    <Routes>
       <Route
            path="/login"
            element={
                !isAuthenticated ? (
                    <Login onLogin={() => setIsAuthenticated(true)} />
                ) : (
                    //Navigate è un componente della libreria route che 
                    //cambia la direzione (URL) indicata in to
                    <Navigate to="/chat" replace />
                )
            }
          />

          <Route
            path= "/register"
            element = {
                !isAuthenticated ? (
                <Register onLogin={() => {setIsAuthenticated(true)}} />
                ) : (
                    <Navigate to="/chat" replace />
                )

            }
            />

          <Route
            path= "/chat"
            element = {
                isAuthenticated ? (
                <Chat onLogout={() => {setIsAuthenticated(false)}} />
                ) : (
                    <Navigate to="/login" replace />
                )

            }
            />

          <Route path="/" element={<Navigate to="/login" replace />} />
         
          
      
      
       </Routes>

    </div>

);
}

export default App;




