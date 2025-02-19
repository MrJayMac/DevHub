import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BlogEditor = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8000/posts", { title, content }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate("/blog");
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div>
            <h1>Create a Post</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
                <button type="submit">Publish</button>
            </form>
        </div>
    );
};

export default BlogEditor;
