import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Blog = ({ limit }) => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8000/posts");
                let fetchedPosts = res.data;
                
                if (limit) {
                    fetchedPosts = fetchedPosts.slice(0, limit); // Only show limited posts
                }

                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, [limit]);

    return (
        <div>
            <h2>Recent Blog Posts</h2>
            {posts.length === 0 ? <p>No posts available.</p> : (
                posts.map((post) => (
                    <div key={post.id} onClick={() => navigate(`/blog/${post.id}`)}>
                        <h3>{post.title}</h3>
                        <p>by {post.username}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Blog;
