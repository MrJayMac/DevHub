import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogPost = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState(""); 

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

    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;
    
        try {
            const res = await axios.post(
                `http://localhost:8000/posts/${id}/comments`,
                { content: replyText, parent_id: parentId },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
    
            setComments((prevComments) => {
                const updateReplies = (comments) => {
                    return comments.map(comment => {
                        if (comment.id === parentId) {
                            return { ...comment, replies: [...(comment.replies || []), res.data] };
                        }
                        return { ...comment, replies: comment.replies ? updateReplies(comment.replies) : [] };
                    });
                };
                return updateReplies(prevComments);
            });
    
            setReplyingTo(null); 
            setReplyText("");  
        } catch (error) {
            console.error("Error adding reply:", error.response?.data || error.message);
        }
    };
    

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:8000/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setComments((prevComments) => {
                const filterComments = (comments) => {
                    return comments
                        .filter(comment => comment.id !== commentId)
                        .map(comment => ({
                            ...comment,
                            replies: comment.replies ? filterComments(comment.replies) : []
                        }));
                };
                return filterComments(prevComments);
            });
        } catch (error) {
            console.error("Error deleting comment:", error.response?.data || error.message);
        }
    };

    const handleReplyClick = (commentId) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
        setReplyText("");
    };

    const renderComments = (commentList) => {
        return commentList.map((comment) => (
            <div key={comment.id} style={{ marginLeft: comment.parent_id ? "20px" : "0px", borderLeft: comment.parent_id ? "2px solid gray" : "none", paddingLeft: "10px" }}>
                <p><strong>{comment.username}:</strong> {comment.content}</p>

                <button onClick={() => handleReplyClick(comment.id)}>↪ Reply</button>

                {user?.id === comment.user_id && (
                    <button onClick={() => handleDeleteComment(comment.id)}>🗑 Delete</button>
                )}

                {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} style={{ marginTop: "5px" }}>
                        <input 
                            type="text" 
                            placeholder="Write a reply..." 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)} 
                        />
                        <button type="submit">Reply</button>
                    </form>
                )}

                {comment.replies?.length > 0 && <div>{renderComments(comment.replies)}</div>}
            </div>
        ));
    };

    if (!post) return <h2>Loading post...</h2>;

    return (
        <div>
            <h1>{post.title}</h1>
            <p>{post.content}</p>

            <button onClick={handleLike}>
                {hasLiked ? "Remove Like" : "Like"} ({likes})
            </button>


            <h2>Comments</h2>
            <form onSubmit={handleCommentSubmit}>
                <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                />
                <button type="submit">Post</button>
            </form>

            {comments.length > 0 ? (
                <div>{renderComments(comments)}</div>
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
};

export default BlogPost;
