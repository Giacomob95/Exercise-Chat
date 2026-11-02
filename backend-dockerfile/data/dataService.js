
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { DataTypes } = require ('sequelize');
const sequelize = require('./dbConfig.js');

const Users  = sequelize.define("Users", {
    username: {
        type: DataTypes.STRING,
        primaryKey : true,
        allowNull : false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


const Messages = sequelize.define ("Messages", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey : true,
        //crea un numero progressivo che aumenta ad ogni creazione di messaggio
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        primaryKey : false,
        allowNull : false

    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
})



const userService = {
    //l'oggetto avrà due metodi 
    createUser: async (username, hashedPassword) => {
        console.log("Creating User:",  {username});

        if (await Users.findByPk(username)) {
            //questo elemento verrà intercettato dalla route corrispondente
            throw new Error('Username already exists');
        }
        await Users.create({ username, password: hashedPassword });
        //restituisco solo lo username, niente dati sensibili
        return {username};
    },
    getUser: async (username) => {
        const user= await Users.findByPk(username);
        if (user !== null) {
                             //plain genera un oggetto più semplificato
            return user.get({ plain: true });

        } else {
            return undefined
        }
    },
    
    //converto in array perchè oggetto Map()
    getAllUsers: async () => {
    const users = await Users.findAll();
    //anche qui semplifico poichè in users.js ho bisogno dell'oggetto semplice 
    return users.map(user => user.get({ plain: true }));
    },

    deleteUser: async(username) => {
        const deletedRows = await Users.destroy({ where: { username } });
        return deletedRows > 0;

    },

    updateUser: async(oldUsername, newUsername) => {
        //cerca user attraverso la primary key(username)
    const user = await Users.findByPk(oldUsername);

    if (!user) {
        throw new Error('User not exists');
    }

    const alreadyTaken = await Users.findByPk(newUsername);
    if (alreadyTaken) {
        throw new Error('Username already exists');
    }
    
    await Users.update(
        { username: newUsername },
        { where: { username: oldUsername } }
    );
    //no delete del vecchio perchè sovrascrivo
    return { username: newUsername };

    },


    updatePassword: async (username, newPassword) => {
         const user = await Users.findByPk(username);
         if (!user) {
            throw new Error('User not exists');
         }
        //uso compare perchè le password sono hashate
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new Error('Password already used');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await user.update({ password: hashedPassword });
        return { username: user.username };
    },

};



const messageService = {
    createMessage: async (content, username) => {
        // l'id UUID lo genera il modello (defaultValue: UUIDV4)
        const newMessage = await Messages.create({ content, username });
        return newMessage.get({ plain: true });
    },

    getMessages: async () => {
        return await Messages.findAll({
            order: [['createdAt', 'ASC']],
            raw: true
        });
    },

    deleteMessages: async (selectedId) => {
        const deletedRows = await Messages.destroy({ where: { id: selectedId } });
        // destroy restituisce quante righe ha cancellato: 0 = non trovato
        return deletedRows > 0;
    },
};


module.exports = { Users, Messages, userService, messageService };