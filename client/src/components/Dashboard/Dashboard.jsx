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
        <div className="flex h-screen w-full justify-center overflow-scroll">
            <div className="flex w-full max-w-[700px] flex-col gap-4 p-4 py-16 font-light text-white">

                {/* 🔹 Logout Button (Styled like Marcelo's) */}
                <button 
                    onClick={logout} 
                    className="text-gray-300 hover:text-white transition font-medium text-sm mb-4"
                >
                    ← Logout
                </button>

                {/* 🔹 Welcome Message */}
                <h1 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    Welcome, {user.username}!
                </h1>

                <p className="text-gray-400">{message}</p>

                {/* 🔹 Action Buttons */}
                <div className="mt-6 flex flex-col space-y-2">
                    <button 
                        onClick={() => navigate("/profile")} 
                        className="text-white text-left hover:text-u-300 transition text-lg"
                    >
                        Edit Profile →
                    </button>
                    <button 
                        onClick={() => navigate("/blog/new")} 
                        className="text-white text-left hover:text-u-300 transition text-lg"
                    >
                        Create a Post →
                    </button>
                </div>

                <hr className="my-4 w-full border-u-300/10" />

                {/* 🔹 Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-gray-500 focus:outline-none"
                    />
                    <button type="submit" className="absolute right-4 top-3 text-gray-400 hover:text-white transition">
                        🔍
                    </button>
                </form>

                {/* 🔹 Search Results */}
                {searchResults.length > 0 && (
                    <div className="w-full mt-6 space-y-6">
                        <h3 className="text-xs uppercase font-medium text-u-300">Search Results</h3>
                        {searchResults.map((result) => (
                            <div 
                                key={result.id} 
                                onClick={() => navigate(`/profile/${result.id}`)}
                                className="cursor-pointer border-l-4 border-blue-500 pl-4 transition hover:opacity-80"
                            >
                                <p className="text-lg font-bold">{result.username}</p>
                                <p className="text-gray-400">{result.bio || "No bio available"}</p>
                            </div>
                        ))}
                    </div>
                )}

                <hr className="my-4 w-full border-u-300/10" />
            </div>
        </div>
    );
};

export default Dashboard;
