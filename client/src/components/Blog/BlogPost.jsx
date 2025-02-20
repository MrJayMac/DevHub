import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext"; 

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth(); 

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

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate("/blog"); 
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    if (!post) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>{post.title}</h1>
            <p>by {post.username}</p>
            <p>{post.content}</p>

            {user && user.username === post.username && (
                <>
                    <button onClick={() => navigate(`/blog/edit/${id}`)}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </>
            )}

            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default BlogPost;
