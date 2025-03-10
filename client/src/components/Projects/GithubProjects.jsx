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
            <h2 className="text-lg font-medium text-u-300 mb-2">GitHub Projects</h2>

            {githubProjects.length === 0 ? (
                <p className="text-gray-400">No public repositories found.</p>
            ) : (
                <div className="space-y-6">
                    {githubProjects.map((project) => (
                        <div 
                            key={project.id} 
                            className="flex justify-between items-center border-b border-neutral-800 pb-4 hover:opacity-80 transition cursor-pointer"
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-gray-500 text-sm">{project.description || "No description available"}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                {project.language && (
                                    <p className="text-sm text-gray-500">{project.language}</p>
                                )}
                                <a 
                                    href={project.html_url} 
                                    target="_blank" 
                                    className="text-blue-400 hover:underline text-sm"
                                >
                                    View →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GitHubProjects;
