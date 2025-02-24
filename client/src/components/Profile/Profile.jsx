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
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-4 p-4 py-16 font-light text-white">

                {/* 🔹 Back Button */}
                <button 
                    onClick={() => navigate("/dashboard")} 
                    className="text-gray-300 hover:text-white transition font-medium text-sm mb-4"
                >
                    ← Back
                </button>

                {/* 🔹 Profile Header */}
                <div className="flex flex-col items-center">
                    {profile.profile_picture && (
                        <img src={profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                    )}
                    <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                        {profile.username}
                    </h2>
                </div>

                {/* 🔹 Bio & Skills Section */}
                <div className="mt-6">
                    <h3 className="text-xs uppercase font-medium text-u-300">About</h3>

                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gray-500 focus:outline-none"
                                placeholder="Write something about yourself..."
                            />
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full p-2 mt-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gray-500 focus:outline-none"
                                placeholder="Skills (comma-separated)"
                            />
                            <div className="flex space-x-4 mt-4">
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition">
                                    Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="text-gray-400">{profile.bio || "No bio available"}</p>
                            <p className="text-gray-400"><strong>Skills:</strong> {profile.skills || "No skills added"}</p>
                            <button onClick={() => setIsEditing(true)} className="text-white text-left hover:text-u-300 transition text-lg mt-4">
                                Edit Profile →
                            </button>
                        </div>
                    )}
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Blog Posts Section */}
                <div className="mt-6">
                    <h3 className="text-xs uppercase font-medium text-u-300">Blog Posts</h3>

                    <div className="mt-2 space-y-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="cursor-pointer border-l-4 border-blue-500 pl-4 transition hover:opacity-80"
                                >
                                    <h3 className="text-lg font-semibold">{post.title}</h3>
                                    <p className="text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No blog posts yet.</p>
                        )}
                    </div>
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 GitHub Projects Section */}
                <div className="mt-6">
                    <h3 className="text-xs uppercase font-medium text-u-300">GitHub Projects</h3>

                    {profile.social_links.github ? (
                        <GitHubProjects githubUsername={profile.social_links.github.split('/').pop()} />
                    ) : (
                        <p className="text-gray-500">No GitHub account linked.</p>
                    )}
                </div>

                <hr className="my-4 w-full border-u-300/10" />
            </div>
        </div>
    );
};

export default Profile;
