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
                    console.log('Registration Successful:', response.data);
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
                    console.log('Login Successful:', response.data.token);
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
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900 opacity-80"></div>

            <div className="relative w-full max-w-lg text-center p-10">
                <h1 className="text-4xl font-bold text-gray-200 mb-6">Welcome</h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    {signUp && (
                        <input 
                            type='email' 
                            placeholder='Email' 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="p-3 w-full bg-transparent border-b-2 border-gray-500 text-white focus:outline-none focus:border-blue-500 transition duration-300"
                        />
                    )}

                    <input 
                        type='text' 
                        placeholder='Username' 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        className="p-3 w-full bg-transparent border-b-2 border-gray-500 text-white focus:outline-none focus:border-blue-500 transition duration-300"
                    />

                    <input 
                        type='password' 
                        placeholder='Password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className="p-3 w-full bg-transparent border-b-2 border-gray-500 text-white focus:outline-none focus:border-blue-500 transition duration-300"
                    />

                    {signUp && (
                        <input 
                            type='password' 
                            placeholder='Confirm Password' 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="p-3 w-full bg-transparent border-b-2 border-gray-500 text-white focus:outline-none focus:border-blue-500 transition duration-300"
                        />
                    )}

                    <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-300 shadow-md">
                        {signUp ? 'Register' : 'Login'}
                    </button>
                </form>

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>} 

                <button 
                    onClick={toggleView} 
                    className="mt-6 text-gray-400 hover:text-gray-200 transition text-sm"
                >
                    {signUp ? "Already have an account?" : "Create an account"}
                </button>
            </div>
        </div>
    );
};

export default Login;
