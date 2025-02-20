import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GitHubProjects from "../Projects/GithubProjects";

const PublicProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:8000/profile/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data) {
                    setProfile(res.data);
                    console.log("Profile loaded:", res.data);
                } else {
                    setError("Profile not found.");
                }
            } catch (error) {
                console.error("Error fetching profile:", error.response?.data || error.message);
                setError(error.response?.data?.error || "Something went wrong.");
            }
        };

        fetchProfile();
    }, [id]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    const githubUsername = profile?.social_links?.github
        ? profile.social_links.github.split("/").pop()
        : null;

    return (
        <div>
            {profile ? (
                <>
                    {profile.profile_picture && <img src={profile.profile_picture} alt={profile.username} width="100" />}
                    <h1>{profile.username}</h1>
                    <p>{profile.bio}</p>
                    <h3>Skills: {profile.skills || "No skills added"}</h3>

                    <h3>GitHub Projects</h3>
                    {githubUsername ? (
                        <GitHubProjects githubUsername={githubUsername} />
                    ) : (
                        <p>🔴 User has not linked their GitHub.</p>
                    )}
                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default PublicProfile;
