import { useEffect, useState } from "react";
import axios from "axios";

const GitHubProjects = ({ githubUsername }) => {
    const [githubProjects, setGitHubProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!githubUsername) return;

        const fetchGitHubProjects = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/github/${githubUsername}`);
                setGitHubProjects(res.data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching GitHub projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubProjects();
    }, [githubUsername]);

    if (loading) return <p className="text-gray-400">Loading GitHub projects...</p>;

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold">GitHub Projects</h2>
            {githubProjects.length === 0 ? (
                <p className="text-gray-400">No public repositories found.</p>
            ) : (
                <div className="space-y-8 mt-4">
                    {githubProjects.map((project) => (
                        <div key={project.id} className="border-l-4 border-blue-500 pl-4">
                            <h3 className="text-xl font-semibold">{project.name}</h3>
                            <p className="mt-2">{project.description || "No description available"}</p>
                            {project.language && (
                                <p className="text-sm text-gray-500 mt-2">Language: {project.language}</p>
                            )}
                            <a href={project.html_url} target="_blank" className="text-blue-400 mt-2 block hover:underline">
                                View on GitHub →
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GitHubProjects;
