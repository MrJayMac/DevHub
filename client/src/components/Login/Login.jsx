import { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";

const Login = () => {
    const { login } = useAuth();
    const [signUp, setSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const toggleView = () => {
        setSignUp((prev) => !prev);
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (signUp) {
            if (!email || !username || !password || !confirmPassword) {
                return setError('All fields are required');
            }
            if (password !== confirmPassword) {
                return setError('Passwords do not match');
            }

            try {
                const response = await axios.post('http://localhost:8000/register', {
                    username,
                    email,
                    password,
                });

                if (response.status === 201) {
                    setSignUp(false);
                } else {
                    setError(response.data.error || 'Something went wrong');
                }
            } catch (error) {
                setError(error.response?.data?.error || "Registration failed. Please try again.");
            }
        } else {
            if (!username || !password) {
                return setError('Username and password are required.');
            }

            try {
                const response = await axios.post('http://localhost:8000/login', {
                    username,
                    password,
                });

                if (response.data.token) {
                    login(response.data.username, response.data.token); 
                } else {
                    setError('Login failed. Please check your credentials.');
                }
            } catch (error) {
                setError(error.response?.data?.error || error.message);
            }
        }
    };

    return (
        <div className="flex h-screen w-full justify-center items-center text-white">
            <div className="relative flex w-full max-w-md flex-col items-center p-8 space-y-6">
                
                {/* 🔹 Welcome Header */}
                <h1 className="text-lg uppercase font-medium text-u-300 tracking-wide">
                    {signUp ? "Create an Account" : "Welcome Back"}
                </h1>

                {/* 🔹 Form */}
                <form onSubmit={handleLogin} className="flex flex-col w-full gap-5">
                    {signUp && (
                        <input 
                            type='email' 
                            placeholder='Email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full p-3 bg-transparent border-b border-gray-500 text-white focus:border-blue-500 focus:outline-none transition"
                        />
                    )}

                    <input 
                        type='text' 
                        placeholder='Username' 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        className="w-full p-3 bg-transparent border-b border-gray-500 text-white focus:border-blue-500 focus:outline-none transition"
                    />

                    <input 
                        type='password' 
                        placeholder='Password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="w-full p-3 bg-transparent border-b border-gray-500 text-white focus:border-blue-500 focus:outline-none transition"
                    />

                    {signUp && (
                        <input 
                            type='password' 
                            placeholder='Confirm Password' 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full p-3 bg-transparent border-b border-gray-500 text-white focus:border-blue-500 focus:outline-none transition"
                        />
                    )}

                    {/* 🔹 Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3 text-sm uppercase font-medium text-white border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition"
                    >
                        {signUp ? 'Register' : 'Login'}
                    </button>
                </form>

                {/* 🔹 Error Message */}
                {error && <p className="text-red-400 text-sm">{error}</p>} 

                {/* 🔹 Toggle Sign Up / Login */}
                <button 
                    onClick={toggleView} 
                    className="text-gray-400 hover:text-white transition text-sm"
                >
                    {signUp ? "Already have an account?" : "Create an account"}
                </button>
            </div>
        </div>
    );
};

export default Login;
