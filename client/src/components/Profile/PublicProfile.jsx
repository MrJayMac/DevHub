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
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center p-8">
            <button onClick={() => navigate("/dashboard")} className="btn mb-4">
                ⬅ Back to Dashboard
            </button>

            {profile ? (
                <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex flex-col items-center">
                        {profile.profile_picture && (
                            <img src={profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                        )}
                        <h1 className="text-3xl font-bold">{profile.username}</h1>
                        <p className="text-gray-400">{profile.bio || "No bio available"}</p>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold">Skills</h3>
                        <p className="text-gray-300">{profile.skills || "No skills added"}</p>
                    </div>

                    {/* Blog Posts */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">Blog Posts</h2>
                        {posts.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                                {posts.map((post) => (
                                    <li
                                        key={post.id}
                                        onClick={() => navigate(`/blog/${post.id}`)}
                                        className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition"
                                    >
                                        <p className="text-lg font-bold">{post.title}</p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">No blog posts yet.</p>
                        )}
                    </div>

                    {/* GitHub Projects (Styled Like Neo Scholar) */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">{profile.username}'s GitHub Projects</h2>
                        {githubUsername ? (
                            <GitHubProjects githubUsername={githubUsername} />
                        ) : (
                            <p className="text-gray-400">🔴 This user has not linked their GitHub.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-white text-center mt-20 text-2xl">Loading profile...</p>
            )}
        </div>
    );
};

export default PublicProfile;
