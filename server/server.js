const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const app = express();


app.post('/register', async (req, res) => {
    const {username, email, password} = req.body;

    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0){
        return res.status(400).json({error: "Username is already in use"})
    }

    const emailCheck = await pool.query('SELEC * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0){
        return res.status(400).json({error: "Email is already in use"})
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
        const signUp = await pool.query('INTSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);

        const token = jwt.sign({username}, process.env.JWT_SECRET, {expiresIn: '1hr'});

        res.status(201).json({message: 'User successfully registered', username, token});
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Something went wrong"})
    }



})