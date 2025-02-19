import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./components/Auth/AuthContext";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Blog from "./components/Blog/Blog";
import BlogEditor from "./components/Blog/BlogEditor";
import BlogPost from "./components/Blog/BlogPost";

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Routes>
          <Route path="/" element={<Login />} />

          <Route 
            path="/dashboard" 
            element={<PrivateRoute><Dashboard /></PrivateRoute>} 
          />

          <Route 
            path="/profile" 
            element={<PrivateRoute><Profile /></PrivateRoute>} 
          />

          <Route 
            path="/blog" 
            element={<PrivateRoute><Blog /></PrivateRoute>} 
          />

          <Route 
            path="/blog/new" 
            element={<PrivateRoute><BlogEditor /></PrivateRoute>} 
          />

          <Route path="/blog/:id" element={<PrivateRoute><BlogPost /></PrivateRoute>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
