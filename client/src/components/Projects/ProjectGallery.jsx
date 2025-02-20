import { useEffect, useState } from "react";
import axios from "axios";

const ProjectGallery = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get("http://localhost:8000/projects");
                setProjects(res.data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <h2>Project Gallery</h2>
            {projects.length === 0 ? <p>No projects available.</p> : (
                projects.map((project) => (
                    <div key={project.id}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <a href={project.github_link} target="_blank" rel="noopener noreferrer">GitHub Repo</a>
                    </div>
                ))
            )}
        </div>
    );
};

export default ProjectGallery;
