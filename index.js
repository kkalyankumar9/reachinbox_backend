const express = require('express');
const session = require("express-session");
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

const allRouter = require('./Routes/route');

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRETKEY,
  resave: false,
  saveUninitialized: false,
}));

// MessageRoutes
app.use('/api/mail', allRouter);


app.get('/', async (req, res) => {
    return res.json({ message: 'Hello World' });
});

app.listen(5000 || process.env.PORT, () => {
    console.log("Server is running on port http://localhost:8000");
});
