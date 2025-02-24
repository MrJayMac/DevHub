import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

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

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-4 p-4 py-16 font-light text-white">
                
                {/* 🔹 Back Button */}
                <button 
                    onClick={() => navigate("/dashboard")} 
                    className="text-gray-300 hover:text-white transition font-medium text-sm mb-4"
                >
                    ← Back
                </button>

                {/* 🔹 Page Title */}
                <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    Recent Blog Posts
                </h2>

                {/* 🔹 Blog Post List */}
                <div className="mt-4 space-y-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div 
                                key={post.id} 
                                onClick={() => navigate(`/blog/${post.id}`)}
                                className="cursor-pointer border-l-4 border-blue-500 pl-4 transition hover:opacity-80"
                            >
                                <h3 className="text-xl font-semibold">{post.title}</h3>
                                <p className="text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                <p className="mt-2 text-gray-300">by {post.username}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No blog posts available.</p>
                    )}
                </div>

                <hr className="my-2 w-full border-u-300/10" />
            </div>
        </div>
    );
};

export default Blog;
