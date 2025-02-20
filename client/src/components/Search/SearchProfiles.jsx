import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchProfiles = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:8000/search?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setResults(res.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <div>
            <h2>Search for Developers</h2>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by username or email"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit">Search</button>
            </form>

            {results.length > 0 ? (
                <ul>
                    {results.map((user) => (
                        <li key={user.id}>
                            <div>
                                {user.profile_picture && (
                                    <img src={user.profile_picture} alt={user.username} width="50" />
                                )}
                                <h3>{user.username}</h3>
                                <p>{user.bio}</p>
                                <button onClick={() => navigate(`/profile/${user.id}`)}>View Profile</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No profiles found.</p>
            )}
        </div>
    );
};

export default SearchProfiles;
