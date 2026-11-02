const { Sequelize } = require('sequelize');

// Se c'è DATABASE_URL usa PostgreSQL (in locale con Docker e online su Render).
// Senza DATABASE_URL usa il file SQLite.
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        // SSL serve online (Render, Supabase); il Postgres locale di Docker lo disattiva con DB_SSL=false
        dialectOptions: process.env.DB_SSL === 'false'
            ? {}
            : { ssl: { require: true, rejectUnauthorized: false } }
    })
    : new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_PATH || './database.sqlite',
        logging: false
    });

module.exports = sequelize;
