import { useEffect, useState } from "react";
import axios from "axios";

const GitHubProjects = ({ githubUsername, limit }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGitHubProjects = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userGitHub = res.data.social_links?.github?.split("/").pop(); // Extract username

                if (userGitHub) {
                    const projectsRes = await axios.get(`http://localhost:8000/github/${userGitHub}`);
                    let fetchedProjects = projectsRes.data;

                    if (limit) {
                        fetchedProjects = fetchedProjects.slice(0, limit); // Limit the number of projects
                    }

                    setProjects(fetchedProjects);
                }
            } catch (error) {
                console.error("Error fetching GitHub projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubProjects();
    }, [githubUsername, limit]);

    if (loading) return <p>Loading GitHub projects...</p>;

    return (
        <div>
            <h2>GitHub Projects</h2>
            {projects.length === 0 ? <p>No public repositories found.</p> : (
                projects.map((project) => (
                    <div key={project.id}>
                        <h3>{project.name}</h3>
                        <p>{project.description || "No description available"}</p>
                        <p>Language: {project.language || "N/A"}</p>
                        <a href={project.html_url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
                    </div>
                ))
            )}
        </div>
    );
};

export default GitHubProjects;
