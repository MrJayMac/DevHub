import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [featuredProfiles, setFeaturedProfiles] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            console.log("User is null, redirecting to login...");
            navigate("/");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage(res.data.message);
            } catch (error) {
                console.error("Error:", error);
                logout();
            }
        };

        const fetchRecentPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8000/posts?limit=3");
                setRecentPosts(res.data);
            } catch (error) {
                console.error("Error fetching recent posts:", error);
            }
        };

        const fetchRandomProfiles = async () => {
            try {
                const res = await axios.get("http://localhost:8000/users/random?limit=3");
                setFeaturedProfiles(res.data);
            } catch (error) {
                console.error("Error fetching random profiles:", error);
            }
        };

        fetchDashboardData();
        fetchRecentPosts();
        fetchRandomProfiles();
    }, [user, navigate, logout]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:8000/search?query=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSearchResults(res.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    if (user === null) return <h1 className="text-white text-center mt-20 text-2xl">Loading...</h1>;

    return (
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[900px] flex-col gap-4 p-4 py-16 font-light text-white">
                
                {/* 🔹 Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={logout} 
                        className="text-gray-300 hover:text-white transition font-medium text-sm"
                    >
                        ← Logout
                    </button>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => navigate("/profile")} 
                            className="text-white hover:text-u-300 transition text-sm"
                        >
                            Edit Profile
                        </button>
                        <button 
                            onClick={() => navigate("/blog/new")} 
                            className="text-white hover:text-u-300 transition text-sm"
                        >
                            Create a Post
                        </button>
                    </div>
                </div>

                <h1 className="text-2xl font-medium text-u-300 tracking-wide">
                    DevHub
                </h1>

                <p className="text-xl text-gray-400">{message}</p>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Search Section */}
                <h2 className="text-xl uppercase font-medium text-u-300 mb-2">Search for Users</h2>

                <form onSubmit={handleSearch} className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-gray-500 focus:outline-none"
                    />
                    <button type="submit" className="absolute right-4 top-3 text-gray-400 hover:text-white transition">
                        🔍
                    </button>
                </form>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Grid Layout for Featured Profiles & Blog Posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 🔹 Featured Profiles */}
                    <div>
                        <h3 className="text-lg uppercase font-medium text-u-300 tracking-wide mb-4">Featured Profiles</h3>
                        <div className="space-y-4">
                            {featuredProfiles.map((profile) => (
                                <div 
                                    key={profile.id} 
                                    onClick={() => navigate(`/profile/${profile.id}`)}
                                    className="flex justify-between items-center border-b border-neutral-800 pb-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">{profile.username} <span className="text-gray-400"></span></h3>
                                        <p className="text-gray-500">{profile.bio || "No bio available"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🔹 Recent Blog Posts */}
                    <div>
                        <h3 className="text-lg uppercase font-medium text-u-300 tracking-wide mb-4">Recent Blog Posts</h3>
                        <div className="space-y-4">
                            {recentPosts.map((post) => (
                                <div 
                                    key={post.id} 
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="flex justify-between items-center border-b border-neutral-800 pb-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">{post.title} <span className="text-gray-400"></span></h3>
                                        <p className="text-gray-500 text-sm">{post.username}</p>
                                    </div>
                                    <p className="text-gray-400 whitespace-nowrap">{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
