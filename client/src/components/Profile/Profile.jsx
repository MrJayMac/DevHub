import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GitHubProjects from "../Projects/GithubProjects";

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        bio: "",
        skills: "",
        experience: [],
        education: [],
        social_links: { github: "", linkedin: "" },
        profile_picture: "",
    });

    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedProfile = res.data;
                setProfile({
                    ...fetchedProfile,
                    experience: fetchedProfile.experience || [],
                    education: fetchedProfile.education || [],
                    social_links: fetchedProfile.social_links || { github: "", linkedin: "" }
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleExperienceChange = (index, field, value) => {
        const updatedExperience = [...profile.experience];
        updatedExperience[index][field] = value;
        setProfile((prev) => ({ ...prev, experience: updatedExperience }));
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...profile.education];
        updatedEducation[index][field] = value;
        setProfile((prev) => ({ ...prev, education: updatedEducation }));
    };

    const addExperience = () => {
        setProfile((prev) => ({
            ...prev,
            experience: [...prev.experience, { company: "", role: "", year: "" }],
        }));
    };

    const addEducation = () => {
        setProfile((prev) => ({
            ...prev,
            education: [...prev.education, { school: "", degree: "", year: "" }],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:8000/profile", profile, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Failed to update profile.");
        }
    };

    return (
        <div>
            <h1>Profile</h1>
            <button onClick={() => navigate("/dashboard")}>Back to dashboard</button>
            <form onSubmit={handleSubmit}>
                <label>Bio:</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} />

                <label>Skills (comma-separated):</label>
                <input type="text" name="skills" value={profile.skills} onChange={handleChange} />

                <h3>Experience</h3>
                {profile.experience.map((exp, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Year"
                            value={exp.year}
                            onChange={(e) => handleExperienceChange(index, "year", e.target.value)}
                        />
                    </div>
                ))}
                <button type="button" onClick={addExperience}>Add Experience</button>

                <h3>Education</h3>
                {profile.education.map((edu, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder="School"
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Year"
                            value={edu.year}
                            onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                        />
                    </div>
                ))}
                <button type="button" onClick={addEducation}>Add Education</button>

                <button type="submit">Update Profile</button>
            </form>
            {message && <p>{message}</p>}

            <h2>Your GitHub</h2>
            {profile.social_links.github ? (
                <p>
                    ✅ Connected to <a href={profile.social_links.github} target="_blank">{profile.social_links.github}</a>
                </p>
            ) : (
                <a href="http://localhost:8000/auth/github">
                    <button>Login with GitHub</button>
                </a>
            )}

            <h2>Your GitHub Projects</h2>
            {profile.social_links.github ? (
                <GitHubProjects githubUsername={profile.social_links.github.split('/').pop()} />
            ) : (
                <p>🔴 Please log in with GitHub to view your projects.</p>
            )}
        </div>
    );
};

export default Profile;
