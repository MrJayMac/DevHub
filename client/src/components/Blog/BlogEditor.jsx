import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BlogEditor = () => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/posts/${id}`);
                    setTitle(res.data.title);
                    setContent(res.data.content);
                } catch (error) {
                    console.error("Error fetching post:", error);
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (id) {
                await axios.put(`http://localhost:8000/posts/${id}`, { title, content }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8000/posts", { title, content }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            navigate("/blog");
        } catch (error) {
            console.error("Error saving post:", error);
        }
    };

    return (
        <div>
            <h1>{id ? "Edit Post" : "Create a Post"}</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Content" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    required 
                />
                <button type="submit">{id ? "Update" : "Publish"}</button>
            </form>
            <button onClick={() => navigate(-1)}>Cancel</button>
        </div>
    );
};

export default BlogEditor;
