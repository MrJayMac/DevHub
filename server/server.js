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

app.get('/profile/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Fetching profile for user ID: ${id}`);

        const user = await pool.query(
            "SELECT id, username, bio, skills, social_links, profile_picture FROM users WHERE id = $1",
            [id]
        );

        if (user.rows.length === 0) {
            console.log("User not found.");
            return res.status(404).json({ error: "User not found" });
        }

        const profileData = user.rows[0];
        profileData.skills = profileData.skills || "No skills added";

        // ✅ FIX: Only parse social_links if it's a string
        if (typeof profileData.social_links === "string") {
            try {
                profileData.social_links = JSON.parse(profileData.social_links);
            } catch (jsonError) {
                console.error("Error parsing social_links JSON:", jsonError);
                profileData.social_links = {};
            }
        } else if (!profileData.social_links) {
            profileData.social_links = {};
        }

        console.log("Profile data fetched successfully:", profileData);
        res.json(profileData);
    } catch (error) {
        console.error("Error fetching profile:", error);
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

//Get all blog posts for a specific user
app.get('/posts/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const posts = await pool.query(
            "SELECT id, title, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );

        res.json(posts.rows);
    } catch (error) {
        console.error("Error fetching user's blog posts:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});



//Github Project
app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user`;
    res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', authenticateToken, async (req, res) => {
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

        const { login } = userResponse.data; 


        const existingUser = await pool.query(
            "SELECT id FROM users WHERE social_links->>'github' = $1",
            [`https://github.com/${login}`]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "This GitHub account is already linked to another DevHub account." });
        }


        await pool.query(
            "UPDATE users SET social_links = jsonb_set(social_links, '{github}', $1) WHERE id = $2",
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

//Search function
app.get('/search', authenticateToken, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const users = await pool.query(
            "SELECT id, username, bio, profile_picture FROM users WHERE username ILIKE $1 LIMIT 5",
            [`%${query}%`]
        );

        res.json(users.rows);
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

//Like feature
app.post('/posts/:id/like', authenticateToken, async (req, res) => {
    const { id: post_id } = req.params;
    const user_id = req.user.id;

    try {
        const existingLike = await pool.query(
            "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
            [user_id, post_id]
        );

        if (existingLike.rows.length > 0) {
            await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [user_id, post_id]);
            const likesCount = await pool.query("SELECT COUNT(*) FROM likes WHERE post_id = $1", [post_id]);
            return res.json({ message: "Like removed.", likes: parseInt(likesCount.rows[0].count, 10), liked: false });
        }


        await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [user_id, post_id]);

        const likesCount = await pool.query("SELECT COUNT(*) FROM likes WHERE post_id = $1", [post_id]);

        res.json({ message: "Post liked successfully.", likes: parseInt(likesCount.rows[0].count, 10), liked: true });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.get('/posts/:id/likes', authenticateToken, async (req, res) => {
    const { id: post_id } = req.params;
    const user_id = req.user.id;

    try {
        const likesCount = await pool.query("SELECT COUNT(*) FROM likes WHERE post_id = $1", [post_id]);

        const userLiked = await pool.query("SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2", [user_id, post_id]);

        res.json({
            likes: parseInt(likesCount.rows[0].count, 10),
            hasLiked: userLiked.rows.length > 0
        });
    } catch (error) {
        console.error("Error fetching likes:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});

//Comments feature
app.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    const { id: post_id } = req.params;
    const user_id = req.user.id;
    const { content, parent_id } = req.body;

    if (!content.trim()) {
        return res.status(400).json({ error: "Comment cannot be empty." });
    }

    try {
        const newComment = await pool.query(
            "INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [post_id, user_id, content, parent_id || null]
        );

        res.status(201).json(newComment.rows[0]);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});


app.get('/posts/:id/comments', async (req, res) => {
    const { id: post_id } = req.params;

    try {
        const comments = await pool.query(
            `SELECT comments.*, users.username FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE post_id = $1 ORDER BY created_at ASC`,
            [post_id]
        );
        
        const commentMap = {};
        comments.rows.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        const topLevelComments = [];
        comments.rows.forEach(comment => {
            if (comment.parent_id) {
                commentMap[comment.parent_id]?.replies.push(comment);
            } else {
                topLevelComments.push(comment);
            }
        });

        res.json(topLevelComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});



app.delete('/comments/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const comment = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);

        if (comment.rows.length === 0) {
            return res.status(404).json({ error: "Comment not found." });
        }

        if (comment.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: "You can only delete your own comments." });
        }

        await pool.query("DELETE FROM comments WHERE id = $1", [id]);
        res.json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});



app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));