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

    if (user === null) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>Dashboard</h1>
            {user && <h2>Welcome, {user.username}!</h2>}
            <p>{message}</p>
            <button onClick={logout}>Logout</button>
            <button onClick={() => navigate("/profile")}>Edit Profile</button>
            <button onClick={() => navigate("/blog/new")}>Create a Post</button>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div>
                    <h3>Search Results</h3>
                    {searchResults.map((result) => (
                        <div key={result.id} onClick={() => navigate(`/profile/${result.id}`)}>
                            <p><strong>{result.username}</strong></p>
                            <p>{result.bio || "No bio available"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
