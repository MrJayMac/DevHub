import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GitHubProjects from "../Projects/GithubProjects";

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        const fetchPosts = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/posts/user/${user.id}`);
                setPosts(res.data);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            }
        };

        fetchProfile();
        fetchPosts();
    }, [user.id]);

    return (
        <div>
            <h1>Profile</h1>
            <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>

            {profile ? (
                <>
                    <h2>{profile.username}</h2>
                    <p>{profile.bio}</p>
                    <h3>Skills: {profile.skills || "No skills added"}</h3>

                    <h2>Your Blog Posts</h2>
                    {posts.length > 0 ? (
                        <ul>
                            {posts.map((post) => (
                                <li key={post.id} onClick={() => navigate(`/blog/${post.id}`)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                                    {post.title} - {new Date(post.created_at).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No blog posts yet.</p>
                    )}

                    <h2>Your GitHub Projects</h2>
                    {profile.social_links.github ? (
                        <GitHubProjects githubUsername={profile.social_links.github.split('/').pop()} />
                    ) : (
                        <p>Please log in with GitHub to view your projects.</p>
                    )}
                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;
