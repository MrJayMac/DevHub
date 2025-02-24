import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8000/posts");
                setPosts(res.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, []);

    const handleDelete = async (postId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove deleted post from state
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[900px] flex-col gap-4 p-4 py-16 font-light text-white">
                
                {/* 🔹 Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className="text-gray-300 hover:text-white transition font-medium text-sm"
                    >
                        ← Dashboard
                    </button>
                    {user && (
                        <button 
                            onClick={() => navigate("/blog/new")} 
                            className="text-white hover:text-u-300 transition text-sm"
                        >
                            Create a Post
                        </button>
                    )}
                </div>

                {/* 🔹 Page Title */}
                <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    Recent Blog Posts
                </h2>

                <div className="mt-4 space-y-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div 
                                key={post.id} 
                                className="flex justify-between items-center border-b border-neutral-800 pb-4"
                            >
                                <div>
                                    <h3 
                                        onClick={() => navigate(`/blog/${post.id}`)} 
                                        className="cursor-pointer text-lg font-semibold hover:text-u-300 transition"
                                    >
                                        {post.title} <span className="text-gray-400">— {post.username}</span>
                                    </h3>
                                    <p className="text-gray-500">{post.excerpt || "No summary available"}</p>
                                </div>
                                <p className="text-gray-400 whitespace-nowrap">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </p>

                                {user && user.username === post.username && (
                                    <button 
                                        onClick={() => handleDelete(post.id)} 
                                        className="text-gray-400 hover:text-red-500 transition"
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No blog posts available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blog;
