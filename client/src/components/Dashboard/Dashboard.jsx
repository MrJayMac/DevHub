import { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
              const res = await axios.get("http://localhost:8000/dashboard", {
                  headers: { Authorization: `Bearer ${token}` },
              });
              setMessage(res.data.message);
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
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Dashboard;
