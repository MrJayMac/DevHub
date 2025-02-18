const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticateToken = require('./middleware/auth');


const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT ?? 8000;



app.post('/register', async (req, res) => {
    const {username, email, password} = req.body;

    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0){
        return res.status(400).json({error: "Username is already in use"})
    }

    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0){
        return res.status(400).json({error: "Email is already in use"})
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
        const signUp = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username', 
            [username, email, hashedPassword]
        );

        const newUser = signUp.rows[0];

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({message: 'User successfully registered', username, token});
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Something went wrong"})
    }

})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (!users.rows[0]) {
            return res.status(400).json({ error: "User not found" });
        }

        const valid = await bcrypt.compare(password, users.rows[0].password);

        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { id: users.rows[0].id, username: users.rows[0].username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1hr' }
        );

        res.json({ username: users.rows[0].username, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});


app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to your dashboard, ${req.user.username}!` });
});

app.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error("Error in /me:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});


app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));