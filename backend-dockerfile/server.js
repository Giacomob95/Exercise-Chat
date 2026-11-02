require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server: SocketIO } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const messageRouter = require("./routes/messages.js");
const userRouter = require("./routes/users.js");
const { router: authRouter } = require("./routes/auth.js");
const { initializeSocketIO } = require("./socket/socket.js");

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use('/messages', messageRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 8000;
const httpServer = http.createServer(app);
const io = new SocketIO(httpServer, {
    cors: { origin: "*" }
});
initializeSocketIO(io);

const sequelize = require("./data/dbConfig.js");

sequelize.sync().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}/`);
    });
});

module.exports = { httpServer, app };