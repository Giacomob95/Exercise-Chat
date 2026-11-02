const express = require("express");
const { userService } = require('../data/dataService.js');
const { checkAuth } = require("./auth.js");

const router = express.Router();

// GET /users — lista di tutti gli utenti
router.get('/', checkAuth, async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        const publicUsers = users.map(user => {
            const { password, ...utentePubblico } = user; //rimuovo la password prima di
                                                        //mandare al front end
            return utentePubblico;
        });

        return res.json(publicUsers);

    } catch (error) {
        return res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});

// GET /users/:username — profilo di un utente specifico
router.get('/:username', checkAuth, async (req, res) => {
    try {
        const { username } = req.params;
        const userByUsername = await userService.getUser(username);

        if (!userByUsername) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        //mostro solo lo username
        return res.json({ username: userByUsername.username });

    } catch (error) {
        return res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
    }
});

// PUT /users/:username — modifica username
router.put('/:username', checkAuth, async (req, res) => {
    try {
        const { username: oldUsername } = req.params;
        const { username: newUsername } = req.body;

        const updatedUser = await userService.updateUser(oldUsername, newUsername);
        const { password, ...utentePubblico } = updatedUser;

        return res.status(200).json(utentePubblico);


    } catch (error) {

        if (error.message === 'Username already exists') {
            return res.status(409).json({ message: 'Username già in uso' });
        }
        if (error.message === 'User not exists') {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        return res.status(500).json({ message: 'Errore durante l\'aggiornamento dell\'utente' });
    }
});


//modifica della password
router.put('/:username/password', checkAuth, async (req, res) => {
    try { 
        //destructuring per prendere il valore della chiave username
         const { username } = req.params; 
         const { password: newPassword } = req.body;

         const updatedPassword = await userService.updatePassword(username, newPassword);
         return res.status(200).json({ message: 'Password aggiornata con successo' });


    } catch(error) {
        if (error.message === 'User not exists') {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        if (error.message === "Password already used") {
            return res.status(400).json({ message: 'La nuova password deve essere diversa dalla precedente' });
        }
        return res.status(500).json({ message: 'Errore durante l\'aggiornamento della password' });

    }

});


// DELETE /users/:username — elimina utente
//agiungere metodo delete nel dataservice 
router.delete('/:username', checkAuth, async (req, res) => {
    try {
        const { username } = req.params;
        const deleted = await userService.deleteUser(username);

        if ( !deleted ) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        

        return res.status(200).json({ message: 'Utente eliminato con successo' });

    } catch (error) {
        return res.status(500).json({ message: "Errore durante l'eliminazione dell'utente"});

    }
});

module.exports = router;