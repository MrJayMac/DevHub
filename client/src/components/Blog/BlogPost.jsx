import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BlogPost = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/posts/${id}`);
                setPost(res.data);
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };

        fetchPost();
    }, [id]);

    if (!post) return <h2 className="text-white text-center mt-20 text-2xl">Loading post...</h2>;

    // Convert new lines into paragraph tags for better formatting
    const formattedContent = post.content
        .split("\n\n")
        .map((para, index) => `<p key=${index}>${para}</p>`)
        .join("");

    // 🔹 Handle Post Deletion
    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate("/blog"); // Redirect back to the blog page after deletion
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-2 p-4 py-16 font-light text-white relative">

                {/* 🔹 Back Button */}
                <button 
                    onClick={() => navigate("/blog")} 
                    className="text-sm text-gray-400 hover:text-white transition w-fit mb-4">
                    &lt; Back
                </button>

                {/* 🔹 Edit & Delete Buttons (Visible Only to Post Owner) */}
                {user && user.username === post.username && (
                    <div className="absolute top-6 right-6 flex gap-2">
                        <button 
                            onClick={() => navigate(`/blog/edit/${id}`)}
                            className="text-gray-400 hover:text-blue-400 transition text-sm border border-gray-600 px-3 py-1 rounded-lg"
                        >
                            ✎ Edit Blog
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-500 transition text-sm border border-gray-600 px-3 py-1 rounded-lg"
                        >
                            🗑 Delete
                        </button>
                    </div>
                )}

                {/* 🔹 Blog Title */}
                <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    {post.title}
                </h2>

                {/* 🔹 Meta Info */}
                <div className="flex flex-row items-center text-sm text-u-300">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                {/* 🔹 Blog Content with Proper Formatting */}
                <article 
                    className="prose prose-invert prose-p:mb-4 prose-p:leading-relaxed prose-h2:mt-6 prose-h2:font-semibold prose-h2:text-lg prose-h3:italic prose-h3:text-sm prose-strong:font-semibold prose-strong:text-gray-300" 
                    dangerouslySetInnerHTML={{ __html: formattedContent }} 
                />
            </div>
        </div>
    );
};

export default BlogPost;
