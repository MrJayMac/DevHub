import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Blog from "../Blog/Blog"; 
import ProjectGallery from "../Projects/ProjectGallery";
import GitHubProjects from "../Projects/GithubProjects";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) return;

        if (!user) {
            console.log("User is null, redirecting to login...");
            navigate("/");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setMessage(data.message);
            } catch (error) {
                console.error("Error:", error);
                logout();
            }
        };

        fetchDashboardData();
    }, [user, navigate, logout]);

    if (user === null) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>Dashboard</h1>
            {user && <h2>Welcome, {user.username}!</h2>}
            <p>{message}</p>

            <h2>Your Projects</h2>
            <ProjectGallery />

            <h2>Your GitHub Projects</h2>
            <GitHubProjects githubUsername={user ? user.username : null} limit={3} />

            <button onClick={logout}>Logout</button>
            <button onClick={() => navigate("/profile")}>Edit Profile</button>
            <button onClick={() => navigate("/blog/new")}>Create New Post</button>

            <Blog limit={3} />

            <button onClick={() => navigate("/blog")}>View All Blogs</button>
        </div>
    );
};

export default Dashboard;
