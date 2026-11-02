const express = require("express")
const { messageService } = require('../data/dataService.js');
const { checkAuth } = require('./auth.js');

const router = express.Router();


router.get("/", checkAuth, async (req, res) => {
    try {
        const messages = await messageService.getMessages();
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching messages' });
    }
});

router.post("/", checkAuth, async (req, res) => {
    try {
        const content = req.body.content;
        // qui prendo il dato dal payload del token dopo aver fatto checkAuth
        const username = req.user.username;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        if (!content) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // prendo il content e lo username e li inserisco usando il dataService
        const message = await messageService.createMessage(content, username);
        //IMPORTANTE : termina la req del client 
        return res.status(201).json(message);

    } catch (error) {
        return res.status(500).json({ message: 'Error creating message' });
    }
});



module.exports = router