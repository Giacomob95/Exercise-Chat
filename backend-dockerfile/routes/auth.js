const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userService } = require("../data/dataService.js");
const { messageService } = require('../data/dataService.js');



const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userCreation = await userService.createUser(username, hashedPassword);

        const token = jwt.sign(
            { username: userCreation.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        //invio anche il token perchè esso deve essere utilizzato dal client per
        //mantenere la sessione attiva(proprio tramite il token)
        return res.status(201).json({ token, username: userCreation.username });

    } catch (error) {
        if (error.message === 'Username already exists') {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error creating user: ' + error.message });
    }
});

router.post("/login", async (req,res) =>{
    try {
        const {username, password}= req.body;
        //se almeno una delle due è vera
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        //a questo punto richiamo lo user che ha quell'username
        const user = await userService.getUser(username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        //qui confronto le password (quella della res e quella dell'utente)
        //lo faccio qui per poter isolare la criptazione e non nel front end
        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // a questo punto mando indietro al frontend token e username
        res.json({ token, username: user.username });
    } catch (error) {
        return res.status(500).json({ message: 'Error during login' });
    }

});

//MIDDLEWARE AUTH 


const checkAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token doesn't exist" });
    }

    const token = authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ message: "Token doesn't exist" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no longer valid' });
        }
        req.user = user;
        next();
    });
};

                       
 
const checkAuthSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication token required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ← era JWT_SECRET senza process.env
        const user = await userService.getUser(decoded.username);

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.username = decoded.username;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
};
module.exports = { router, checkAuth,  checkAuthSocket}; 