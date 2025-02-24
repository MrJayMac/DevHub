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
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-4 p-4 py-16 font-light text-white">
                
                {/* 🔹 Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-gray-300 hover:text-white transition font-medium text-sm mb-4"
                >
                    ← Cancel
                </button>

                {/* 🔹 Title */}
                <h1 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    {id ? "Edit Post" : "Create a Post"}
                </h1>

                {/* 🔹 Blog Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition"
                    />

                    <textarea 
                        placeholder="Write your content here..." 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        required 
                        className="w-full h-40 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition"
                    />

                    <div className="flex space-x-4">
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition"
                        >
                            {id ? "Update" : "Publish"}
                        </button>

                        <button 
                            onClick={() => navigate(-1)} 
                            className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEditor;
