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
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Ensure social_links is always an object
                setProfile({
                    ...res.data,
                    social_links: res.data.social_links || {}, 
                });
                setBio(res.data.bio || "");
                setSkills(res.data.skills || "");
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

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:8000/profile", { bio, skills }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile((prev) => ({ ...prev, bio, skills }));
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (!profile) return <p className="text-white text-center mt-20 text-2xl">Loading profile...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center p-8">
            <button onClick={() => navigate("/dashboard")} className="btn mb-4">
                ⬅ Back to Dashboard
            </button>

            <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    {profile.profile_picture && (
                        <img src={profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                    )}
                    <h2 className="text-3xl font-bold">{profile.username}</h2>
                    
                    {/* Edit Bio & Skills Section */}
                    {isEditing ? (
                        <div className="mt-4 w-full">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                                placeholder="Write something about yourself..."
                            />
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full p-2 mt-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                                placeholder="Skills (comma-separated)"
                            />
                            <div className="flex space-x-4 mt-4">
                                <button onClick={handleSave} className="btn">Save</button>
                                <button onClick={() => setIsEditing(false)} className="btn bg-gray-600">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-center">
                            <p className="text-gray-400">{profile.bio || "No bio available"}</p>
                            <p className="text-gray-400"><strong>Skills:</strong> {profile.skills || "No skills added"}</p>
                            <button onClick={() => setIsEditing(true)} className="btn mt-4">Edit Profile</button>
                        </div>
                    )}
                </div>

                {/* Blog Posts */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold">Your Blog Posts</h2>
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

                {/* GitHub Projects */}
                <div className="mt-6">
                    {profile.social_links.github ? (
                        <GitHubProjects githubUsername={profile.social_links.github.split('/').pop()} />
                    ) : (
                        <p className="text-gray-400">No GitHub account linked.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
