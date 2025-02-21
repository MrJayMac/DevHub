import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
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

        fetchDashboardData();
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
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-4">Welcome, {user.username}!</h1>
            <p className="text-gray-400 mb-6">{message}</p>

            <div className="flex space-x-4 mb-8">
                <button onClick={logout} className="btn">
                    Logout
                </button>
                <button onClick={() => navigate("/profile")} className="btn">
                    Edit Profile
                </button>
                <button onClick={() => navigate("/blog/new")} className="btn">
                    Create a Post
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-lg">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <button type="submit" className="absolute right-4 top-3 text-gray-400 hover:text-white transition">
                        🔍
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="w-full max-w-lg mt-8">
                    <h3 className="text-xl font-semibold mb-4">Search Results</h3>
                    {searchResults.map((result) => (
                        <div 
                            key={result.id} 
                            onClick={() => navigate(`/profile/${result.id}`)}
                            className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition mb-3"
                        >
                            <p className="text-lg font-bold">{result.username}</p>
                            <p className="text-gray-400">{result.bio || "No bio available"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
