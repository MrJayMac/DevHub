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
    const [githubLink, setGithubLink] = useState("");
    const [isAddingGitHub, setIsAddingGitHub] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const profileData = {
                    ...res.data,
                    social_links: res.data.social_links || {},
                };

                setProfile(profileData);
                setBio(profileData.bio || "");
                setSkills(profileData.skills || "");
                setGithubLink(profileData.social_links?.github || "");

                if (profileData.id) {
                    const postsRes = await axios.get(`http://localhost:8000/posts/user/${profileData.id}`);
                    setPosts(postsRes.data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:8000/profile", { bio, skills, social_links: { github: githubLink } }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile((prev) => ({
                ...prev,
                bio,
                skills,
                social_links: { ...prev.social_links, github: githubLink }
            }));
            setIsEditing(false);
            setIsAddingGitHub(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete("http://localhost:8000/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate("/"); // Redirect after deletion
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    if (loading) return <p className="text-gray-400 text-center mt-20 text-2xl">Loading profile...</p>;

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll relative">
            <div className="flex w-full max-w-[700px] flex-col gap-6 p-4 py-16 font-light text-white">

                {/* 🔹 Header Section */}
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className="text-gray-400 hover:text-white transition text-sm border border-gray-600 px-3 py-1 rounded-lg"
                    >
                        ← Back
                    </button>
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-gray-400 hover:text-white transition text-sm border border-gray-600 px-3 py-1 rounded-lg"
                    >
                        Edit Profile ✎
                    </button>
                </div>

                {/* 🔹 Profile Header */}
                <div className="flex flex-col items-center mt-6">
                    {profile.profile_picture && (
                        <img src={profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                    )}
                    <h2 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                        {profile.username}
                    </h2>
                </div>

                {/* 🔹 Bio & Skills Section */}
                <div>
                    <h3 className="text-xs uppercase font-medium text-u-300 mb-2">About</h3>

                    {isEditing ? (
                        <div className="space-y-4">
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
                                className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gray-500 focus:outline-none"
                                placeholder="Skills (comma-separated)"
                            />
                            <div className="flex space-x-4">
                                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition">
                                    Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-400">{profile.bio || "No bio available"}</p>
                            <p className="text-gray-400"><strong>Skills:</strong> {profile.skills || "No skills added"}</p>
                        </div>
                    )}
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Blog Posts Section */}
                <div>
                    <h3 className="text-xs uppercase font-medium text-u-300">Blog Posts</h3>
                    <div className="mt-4 space-y-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="flex justify-between items-center border-b border-neutral-800 pb-4 hover:opacity-80 transition cursor-pointer"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">{post.title}</h3>
                                        <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No blog posts yet.</p>
                        )}
                    </div>
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 GitHub Projects Section */}
                <div>
                    <h3 className="text-xs uppercase font-medium text-u-300">GitHub Projects</h3>
                    {profile.social_links.github ? (
                        <GitHubProjects githubUsername={profile.social_links.github.split('/').pop()} />
                    ) : isAddingGitHub ? (
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Enter GitHub profile URL"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                                className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gray-500 focus:outline-none"
                            />
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAddingGitHub(true)}
                            className="text-gray-400 hover:text-white transition text-sm border border-gray-600 px-3 py-1 rounded-lg mt-2"
                        >
                            + Add GitHub
                        </button>
                    )}
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔥 Delete Account Button */}
                {isEditing && (
                    <button onClick={handleDeleteAccount} className="text-red-500 hover:text-red-700 transition text-sm border border-red-600 px-3 py-1 rounded-lg">
                        Delete Account
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
