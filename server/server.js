const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticateToken = require('./middleware/auth');


const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT ?? 8000;


// Login and registration routes
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


// Profile Routes
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, username, email, bio, skills, experience, education, social_links, profile_picture FROM users WHERE id = $1", 
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.put('/profile', authenticateToken, async (req, res) => {
    const { bio, skills, experience, education, social_links, profile_picture } = req.body;

    try {
        await pool.query(
            "UPDATE users SET bio = $1, skills = $2, experience = $3, education = $4, social_links = $5, profile_picture = $6 WHERE id = $7",
            [bio, skills, JSON.stringify(experience), JSON.stringify(education), JSON.stringify(social_links), profile_picture, req.user.id]
        );

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//  Create a New Blog Post
app.post('/posts', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    try {
        const newPost = await pool.query(
            "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, title, content]
        );
        res.status(201).json(newPost.rows[0]);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//  Get All Blog Posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await pool.query("SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC");
        res.json(posts.rows);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//  Get a Single Blog Post
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await pool.query(
            "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
            [id]
        );

        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.json(post.rows[0]);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//  Edit a Blog Post
app.put('/posts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await pool.query(
            "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
            [title, content, id]
        );

        res.json({ message: "Post updated successfully" });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//  Delete a Blog Post (Only Author Can Delete)
app.delete('/posts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [id]);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.put('/posts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await pool.query(
            "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
            [title, content, id]
        );

        res.json({ message: "Post updated successfully" });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.delete('/posts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [id]);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});


//Github Project
app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user`;
    res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: "No authorization code provided" });
    }

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        const { login, avatar_url } = userResponse.data;

        await pool.query("UPDATE users SET social_links = jsonb_set(social_links, '{github}', $1) WHERE id = $2",
            [JSON.stringify(`https://github.com/${login}`), req.user.id]
        );

        res.redirect(`http://localhost:3000/profile`); 
    } catch (error) {
        console.error("GitHub OAuth error:", error);
        res.status(500).json({ error: "GitHub authentication failed" });
    }
});



app.get('/github/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated`);
        const repositories = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count
        }));

        res.json(repositories);
    } catch (error) {
        console.error("Error fetching GitHub repositories:", error);
        res.status(500).json({ error: "Failed to fetch GitHub repositories" });
    }
});




app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));