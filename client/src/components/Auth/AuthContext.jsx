import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                return;
            }
    
            try {
                const res = await axios.get("http://localhost:8000/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                console.log("User data from /me:", res.data);
                setUser(res.data);
            } catch (error) {
                console.error("Auth error in /me:", error.response?.data || error.message);
                localStorage.removeItem("token");
                setUser(null);
                if (window.location.pathname !== "/") {
                    navigate("/");
                }
            }
        };
    
        checkAuth();
    }, [navigate]);
    

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        setUser(userData);
        navigate("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
