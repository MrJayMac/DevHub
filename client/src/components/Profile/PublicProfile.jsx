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

                setProfile({
                    ...res.data,
                    social_links: res.data.social_links || {},
                });

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
                    <p className="text-gray-400 mt-2">{profile.bio || "No bio available"}</p>
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Skills Section */}
                <div className="mt-6">
                    <h3 className="text-xs uppercase font-medium text-u-300">Skills</h3>
                    <p className="text-gray-300">{profile.skills || "No skills added"}</p>
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

                    {githubUsername ? (
                        <GitHubProjects githubUsername={githubUsername} />
                    ) : (
                        <p className="text-gray-500">No GitHub account linked.</p>
                    )}
                </div>

                <hr className="my-4 w-full border-u-300/10" />
            </div>
        </div>
    );
};

export default PublicProfile;
