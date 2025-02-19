import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BlogPost = () => {
    const { id } = useParams(); // Get the post ID from the URL
    const [post, setPost] = useState(null);
    const navigate = useNavigate();

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

    if (!post) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>{post.title}</h1>
            <p>by {post.username}</p>
            <p>{post.content}</p>
            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default BlogPost;
