import { useEffect, useState } from "react";
import axios from "axios";

const GitHubProjects = ({ githubUsername }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGitHubProjects = async () => {
            try {
                if (!githubUsername) {
                    setError("No GitHub username provided.");
                    setLoading(false);
                    return;
                }

                console.log(`Fetching GitHub projects for: ${githubUsername}`);

                const res = await axios.get(`http://localhost:8000/github/${githubUsername}`);

                console.log("GitHub API Response:", res.data);

                if (res.data.length === 0) {
                    setError("No public repositories found.");
                } else {
                    setProjects(res.data);
                }
            } catch (error) {
                console.error("Error fetching GitHub projects:", error);
                setError("Failed to fetch GitHub projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubProjects();
    }, [githubUsername]);

    if (loading) return <p>Loading GitHub projects...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            {projects.length === 0 ? (
                <p>No public repositories found.</p>
            ) : (
                projects.map((project) => (
                    <div key={project.id}>
                        <h3>{project.name}</h3>
                        <p>{project.description || "No description available"}</p>
                        <p>Language: {project.language || "N/A"}</p>
                        <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </div>
                ))
            )}
        </div>
    );
};

export default GitHubProjects;
