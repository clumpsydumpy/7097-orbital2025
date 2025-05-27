const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/Formdata');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
    'mongodb+srv://shaoyang0007:8Sz6nTTqYsCGLFtV@orb.ide4eus.mongodb.net/orbital?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.post('/register', (req, res) => {
    const { userId, password } = req.body;

    FormDataModel.findOne({ userId })
        .then(user => {
            if (user) {
                res.json("Already registered");
            } else {
                FormDataModel.create({ userId, password })
                    .then(newUser => res.json(newUser))
                    .catch(err => {
                        console.error("Error creating user:", err);
                        res.status(500).json("Registration failed");
                    });
            }
        })
        .catch(err => {
            console.error("Error finding user:", err);
            res.status(500).json("Server error");
        });
});

app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    FormDataModel.findOne({ userId })
        .then(user => {
            if (!user) return res.json("No records found!");
            if (user.password === password) {
                res.json("Success");
            } else {
                res.json("Wrong password");
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            res.status(500).json("Server error");
        });
});

app.listen(3001, () => {
    console.log("Server listening on http://127.0.0.1:3001");
});
