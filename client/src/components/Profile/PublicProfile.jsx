import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GitHubProjects from "../Projects/GithubProjects";

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [githubUsername, setGithubUsername] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:8000/profile/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(res.data);

                // ✅ Extract GitHub username from the stored URL
                if (res.data.social_links?.github) {
                    const username = res.data.social_links.github.split("/").pop();
                    setGithubUsername(username);
                }
            } catch (error) {
                console.error("Error fetching profile:", error.response?.data || error.message);
            }
        };

        const fetchPosts = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/posts/user/${id}`);
                setPosts(res.data);
            } catch (error) {
                console.error("Error fetching user posts:", error);
            }
        };

        fetchProfile();
        fetchPosts();
    }, [id]);

    return (
        <div>
            {profile ? (
                <>
                    <h1>{profile.username}</h1>
                    <p>{profile.bio}</p>
                    <h3>Skills: {profile.skills || "No skills added"}</h3>

                    <h2>Blog Posts</h2>
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

                    {/* ✅ GitHub Projects Section */}
                    <h2>{profile.username}'s GitHub Projects</h2>
                    {githubUsername ? (
                        <GitHubProjects githubUsername={githubUsername} />
                    ) : (
                        <p>🔴 This user has not linked their GitHub.</p>
                    )}
                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default PublicProfile;
