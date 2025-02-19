import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        bio: "",
        skills: "",
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

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [name]: value,
            },
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
            <form onSubmit={handleSubmit}>
                <label>Bio:</label>
                <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                />

                <label>Skills (comma-separated):</label>
                <input
                    type="text"
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                />

                <label>GitHub Link:</label>
                <input
                    type="text"
                    name="github"
                    value={profile.social_links.github}
                    onChange={handleSocialChange}
                />

                <label>LinkedIn Link:</label>
                <input
                    type="text"
                    name="linkedin"
                    value={profile.social_links.linkedin}
                    onChange={handleSocialChange}
                />

                <label>Profile Picture URL:</label>
                <input
                    type="text"
                    name="profile_picture"
                    value={profile.profile_picture}
                    onChange={handleChange}
                />

                <button type="submit">Update Profile</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Profile;
