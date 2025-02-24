import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BlogPost = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            const res = await axios.get(`http://localhost:8000/posts/${id}`);
            setPost(res.data);
        };

        const fetchLikes = async () => {
            const res = await axios.get(`http://localhost:8000/posts/${id}/likes`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setLikes(parseInt(res.data.likes, 10));
            setHasLiked(res.data.hasLiked);
        };

        const fetchComments = async () => {
            const res = await axios.get(`http://localhost:8000/posts/${id}/comments`);
            setComments(res.data);
        };

        fetchPost();
        fetchLikes();
        fetchComments();
    }, [id]);

    const handleLike = async () => {
        try {
            const res = await axios.post(
                `http://localhost:8000/posts/${id}/like`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setLikes(res.data.likes);
            setHasLiked(res.data.liked);
        } catch (error) {
            console.error("Error liking post:", error.response?.data || error.message);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await axios.post(
                `http://localhost:8000/posts/${id}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setComments([res.data, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error.response?.data || error.message);
        }
    };

    if (!post) return <h2 className="text-white text-center mt-20 text-2xl">Loading post...</h2>;

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-2 p-4 py-16 font-light text-white">
                
                {/* 🔹 Back Button */}
                <button 
                    onClick={() => navigate("/blog")} 
                    className="text-sm text-gray-400 hover:text-white transition w-fit mb-4">
                    &lt; Back
                </button>

                {/* Blog Title */}
                <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    {post.title}
                </h2>

                {/* Meta Info */}
                <div className="flex flex-row items-center text-sm text-u-300">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                {/* Blog Content */}
                <article className="prose prose-headings:font-medium prose-headings:uppercase prose-headings:leading-none prose-headings:text-u-300 prose-h1:text-sm prose-h2:text-xs prose-h3:text-xs prose-h3:italic prose-p:text-[15px] prose-p:font-light prose-p:leading-snug prose-p:text-white prose-a:text-u-300 prose-a:underline hover:prose-a:text-white prose-blockquote:border-l-2 prose-blockquote:border-u-300 prose-blockquote:pl-4 prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:text-u-300">
                    <p>{post.content}</p>
                </article>

                <hr className="my-2 w-full border-u-300/10" />

                {/* Like Button (Heart Emoji) */}
                <div className="flex justify-start mt-3">
                    <button 
                        onClick={handleLike} 
                        className="text-lg text-gray-400 hover:text-red-500 transition">
                        {hasLiked ? "❤️" : "🤍"} <span className="text-sm text-gray-500 ml-1">{likes}</span>
                    </button>
                </div>

                {/* Comment Section */}
                <div className="mt-12">
                    <h2 className="text-xs uppercase font-medium text-u-300">Comments</h2>

                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-3">
                        <input 
                            type="text"
                            placeholder="Write a comment..." 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none text-sm"
                        />
                        <button 
                            type="submit" 
                            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition">
                            Post
                        </button>
                    </form>

                    {/* Display Comments */}
                    <div className="mt-6 space-y-6">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="p-3 bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-400">
                                        <strong>{comment.username}:</strong> {comment.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No comments yet.</p>
                        )}
                    </div>
                </div>

                <hr className="my-2 w-full border-u-300/10" />
            </div>
        </div>
    );
};

export default BlogPost;
